"""Admin directory and provisioning for Mongo `users` (Visithon card holders) + `visithon_cards`."""
from __future__ import annotations

from datetime import datetime

from fastapi import HTTPException
from pymongo.errors import DuplicateKeyError, PyMongoError

from admin_panel.mongo_cards_source import admin_row_from_visithon_doc
from database import user_collection, visithon_collection
from bson import ObjectId
from digital_card.card_auth import check_card_status, create_access_token
from digital_card.mongo_users_service import email_taken_anywhere, ensure_visithon_user_indexes
from digital_card.security import hash_password
from digital_card.visithon_card_templates import blank_visithon_card_document


def _row_from_user_only(u: dict) -> dict:
    uid = str(u["_id"])
    ca = u.get("created_at")
    joined = ca.isoformat() if hasattr(ca, "isoformat") else str(ca or "")
    return {
        "_id": uid,
        "user_id": uid,
        "has_card_document": False,
        "user": {"name": (u.get("full_name") or u.get("email", "").split("@")[0] or "—")},
        "cardTitle": "",
        "company": "",
        "headline": u.get("full_name") or u.get("email", "—"),
        "subline": "",
        "avatar_path": "",
        "views": 0,
        "whatsapp_taps": 0,
        "status": str(u.get("status") or "pending").lower(),
        "phone": "",
        "email": str(u.get("email") or ""),
        "plan_label": "Free Plan",
        "joined_at": joined,
    }


async def admin_card_edit_session(card_id: str) -> dict:
    """
    Admin-only: mint a card-user JWT for wizard/edit without the user's password.
    """
    cid = str(card_id or "").strip()
    if not cid or not ObjectId.is_valid(cid):
        raise HTTPException(status_code=400, detail="Invalid card id")
    try:
        doc = await visithon_collection.find_one({"_id": ObjectId(cid)})
    except PyMongoError as exc:
        raise HTTPException(status_code=503, detail="Database error") from exc
    if not doc:
        raise HTTPException(status_code=404, detail="Card not found")

    email = str(doc.get("email") or "").lower().strip()
    mongo_user_id = str(doc.get("user_id") or "").strip()
    profile = doc.get("profile") if isinstance(doc.get("profile"), dict) else {}
    s2 = profile.get("step2") if isinstance(profile.get("step2"), dict) else {}
    full_name = (s2.get("full_name") or doc.get("fullName") or "").strip()
    has_card = check_card_status(doc)
    token = create_access_token({"sub": email or cid, "id": cid})

    return {
        "ok": True,
        "card_id": cid,
        "user_id": mongo_user_id,
        "email": email,
        "token": token,
        "user": {
            "id": cid,
            "email": email,
            "fullName": full_name,
            "has_card": has_card,
            "user_id": mongo_user_id,
        },
    }


async def provision_card_user_from_admin(data: dict) -> dict:
    """
    Admin-only: create Mongo `users` row (hashed password) + linked `visithon_cards` doc.
    Response keys match AdminCreateCardUserPage: ok, user_id, card_id, email, token, user.
    """
    email = str(data.get("email") or "").lower().strip()
    password = str(data.get("password") or "")
    full_name = str(data.get("full_name") or data.get("name") or "").strip()
    if not email or not password:
        raise HTTPException(status_code=400, detail="email and password are required")
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    await ensure_visithon_user_indexes()
    if await email_taken_anywhere(email):
        raise HTTPException(status_code=400, detail="Email is already registered.")

    display_name = full_name or email.split("@")[0]
    udoc = {
        "email": email,
        "password": hash_password(password),
        "full_name": display_name,
        "status": "active",
        "created_at": datetime.utcnow(),
        "visithon_card": True,
    }
    try:
        user_result = await user_collection.insert_one(udoc)
    except DuplicateKeyError as exc:
        raise HTTPException(status_code=400, detail="Email is already registered.") from exc
    except PyMongoError as exc:
        raise HTTPException(status_code=503, detail="Database error") from exc

    user_id = str(user_result.inserted_id)
    card_doc = blank_visithon_card_document(
        full_name=display_name,
        email=email,
        user_id=user_id,
    )
    try:
        card_result = await visithon_collection.insert_one(card_doc)
    except PyMongoError as exc:
        await user_collection.delete_one({"_id": user_result.inserted_id})
        raise HTTPException(status_code=503, detail="Database error") from exc

    card_id = str(card_result.inserted_id)
    token = create_access_token({"sub": email, "id": card_id})
    return {
        "ok": True,
        "user_id": user_id,
        "card_id": card_id,
        "email": email,
        "token": token,
        "user": {
            "id": card_id,
            "email": email,
            "fullName": display_name,
            "has_card": False,
            "user_id": user_id,
        },
    }


async def list_mongo_app_user_rows(limit: int = 500) -> list[dict]:
    try:
        cur = user_collection.find({"visithon_card": True}).sort("created_at", -1).limit(limit)
        users = await cur.to_list(length=limit)
    except PyMongoError as exc:
        raise HTTPException(status_code=503, detail="Database error") from exc

    out: list[dict] = []
    for u in users:
        uid = str(u["_id"])
        try:
            card = await visithon_collection.find_one({"user_id": uid})
        except PyMongoError:
            card = None
        if card:
            row = admin_row_from_visithon_doc(card)
            row["user_id"] = uid
            row["has_card_document"] = True
        else:
            row = _row_from_user_only(u)
        out.append(row)
    return out
