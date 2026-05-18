"""Visithon saved contacts directory (per card-user account)."""
from __future__ import annotations

from datetime import datetime

from bson import ObjectId
from fastapi import APIRouter, Body, Depends, HTTPException
from pymongo.errors import PyMongoError

from database import visithon_collection, visithon_saved_contacts_collection
from digital_card.card_view import _public_card_payload
from digital_card.wizard_utils import _user_id_from_token

router = APIRouter()


def _card_snapshot(user_data: dict) -> dict:
    uid_str = str(user_data["_id"])
    payload = _public_card_payload(user_data, uid_str)
    avatar = (payload.get("avatar_static_path") or payload.get("legacy_profile_img") or "").strip()
    return {
        "card_user_id": uid_str,
        "name": (payload.get("name") or "Visithon contact").strip()[:160],
        "avatar_path": avatar[:500],
    }


@router.post("/contacts/save")
async def save_contact(
    data: dict = Body(...),
    owner_user_id: str = Depends(_user_id_from_token),
):
    card_id = str(data.get("card_id") or data.get("card_user_id") or data.get("user_id") or "").strip()
    if not card_id or not ObjectId.is_valid(card_id):
        raise HTTPException(status_code=400, detail="Valid card_id is required")
    if card_id == owner_user_id:
        raise HTTPException(status_code=400, detail="Cannot save your own card to the directory")

    try:
        card_doc = await visithon_collection.find_one({"_id": ObjectId(card_id)})
    except PyMongoError as exc:
        raise HTTPException(status_code=503, detail="Database error") from exc
    if not card_doc:
        raise HTTPException(status_code=404, detail="Card not found")

    snap = _card_snapshot(card_doc)
    now = datetime.utcnow()
    try:
        await visithon_saved_contacts_collection.update_one(
            {"owner_user_id": owner_user_id, "card_user_id": card_id},
            {
                "$set": {
                    "owner_user_id": owner_user_id,
                    "card_user_id": card_id,
                    "name": snap["name"],
                    "avatar_path": snap["avatar_path"],
                    "updated_at": now,
                },
                "$setOnInsert": {"saved_at": now},
            },
            upsert=True,
        )
    except PyMongoError as exc:
        raise HTTPException(status_code=503, detail="Database error") from exc

    return {"ok": True, "contact": snap}


@router.get("/contacts/list")
async def list_contacts(owner_user_id: str = Depends(_user_id_from_token)):
    try:
        cursor = visithon_saved_contacts_collection.find({"owner_user_id": owner_user_id}).sort(
            "updated_at", -1
        )
        docs = await cursor.to_list(200)
    except PyMongoError as exc:
        raise HTTPException(status_code=503, detail="Database error") from exc

    items = []
    for doc in docs:
        card_id = str(doc.get("card_user_id") or "").strip()
        if not card_id:
            continue
        name = str(doc.get("name") or "").strip()
        avatar_path = str(doc.get("avatar_path") or "").strip()
        saved_at = doc.get("saved_at") or doc.get("updated_at")
        items.append(
            {
                "card_user_id": card_id,
                "name": name or "Visithon contact",
                "avatar_path": avatar_path,
                "saved_at": saved_at.isoformat() if hasattr(saved_at, "isoformat") else saved_at,
            }
        )
    return {"items": items}
