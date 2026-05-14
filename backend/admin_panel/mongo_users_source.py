"""Admin directory for Mongo `users` (Visithon card holders) joined with `visithon_cards`."""
from __future__ import annotations

from fastapi import HTTPException
from pymongo.errors import PyMongoError

from admin_panel.mongo_cards_source import admin_row_from_visithon_doc
from database import user_collection, visithon_collection


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
