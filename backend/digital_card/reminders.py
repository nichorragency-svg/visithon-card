"""Per-user reminders stored on visithon_cards.reminders."""
from __future__ import annotations

import uuid
from datetime import datetime

from bson import ObjectId
from fastapi import APIRouter, Body, Depends, HTTPException
from pymongo.errors import PyMongoError

from database import visithon_collection
from digital_card.wizard import _user_id_from_token

router = APIRouter()

_MAX_REMINDERS = 120
_MAX_TITLE = 200
_MAX_NOTE = 2000
_TYPES = frozenset({"Follow Up", "Meeting", "Personal", "Other"})


def _normalize_reminder(raw: dict) -> dict | None:
    if not isinstance(raw, dict):
        return None
    title = (raw.get("title") or "").strip()
    if not title:
        return None
    date_s = (raw.get("date") or "").strip()[:32]
    time_s = (raw.get("time") or "").strip()[:16]
    rtype = (raw.get("type") or "Follow Up").strip()
    if rtype not in _TYPES:
        rtype = "Other"
    note = (raw.get("note") or "").strip()[:_MAX_NOTE]
    rid = (raw.get("id") or "").strip() or str(uuid.uuid4())
    rid = rid[:80]
    created = raw.get("created_at")
    if not isinstance(created, str):
        created = datetime.utcnow().isoformat() + "Z"
    return {
        "id": rid,
        "title": title[:_MAX_TITLE],
        "date": date_s,
        "time": time_s,
        "type": rtype,
        "note": note,
        "created_at": created,
    }


@router.get("")
async def list_reminders(uid: str = Depends(_user_id_from_token)):
    try:
        doc = await visithon_collection.find_one({"_id": ObjectId(uid)}, {"reminders": 1})
    except (PyMongoError, ValueError) as exc:
        raise HTTPException(status_code=503, detail="Database error") from exc
    if not doc:
        raise HTTPException(status_code=404, detail="User not found")
    raw = doc.get("reminders") or []
    if not isinstance(raw, list):
        raw = []
    out = []
    for it in raw:
        n = _normalize_reminder(it) if isinstance(it, dict) else None
        if n:
            out.append(n)
    out.sort(key=lambda x: (x.get("date") or "", x.get("time") or ""), reverse=True)
    return {"reminders": out}


@router.post("")
async def create_reminder(
    data: dict = Body(...),
    uid: str = Depends(_user_id_from_token),
):
    title = (data.get("title") or "").strip()
    if not title:
        raise HTTPException(status_code=400, detail="title is required")
    date_s = (data.get("date") or "").strip()
    if not date_s:
        raise HTTPException(status_code=400, detail="date is required")
    time_s = (data.get("time") or "").strip()
    if not time_s:
        raise HTTPException(status_code=400, detail="time is required")
    rtype = (data.get("type") or "Follow Up").strip()
    if rtype not in _TYPES:
        rtype = "Other"
    note = (data.get("note") or "").strip()[:_MAX_NOTE]
    new = {
        "id": str(uuid.uuid4()),
        "title": title[:_MAX_TITLE],
        "date": date_s[:32],
        "time": time_s[:16],
        "type": rtype,
        "note": note,
        "created_at": datetime.utcnow().isoformat() + "Z",
    }
    try:
        doc = await visithon_collection.find_one({"_id": ObjectId(uid)}, {"reminders": 1})
    except (PyMongoError, ValueError) as exc:
        raise HTTPException(status_code=503, detail="Database error") from exc
    if not doc:
        raise HTTPException(status_code=404, detail="User not found")
    cur = doc.get("reminders") or []
    if not isinstance(cur, list):
        cur = []
    if len(cur) >= _MAX_REMINDERS:
        raise HTTPException(status_code=400, detail="Too many reminders")
    cur = [x for x in cur if isinstance(x, dict)]
    cur.append(new)
    try:
        await visithon_collection.update_one(
            {"_id": ObjectId(uid)},
            {"$set": {"reminders": cur}},
        )
    except (PyMongoError, ValueError) as exc:
        raise HTTPException(status_code=503, detail="Database error") from exc
    return {"ok": True, "reminder": new}


@router.delete("/{reminder_id}")
async def delete_reminder(
    reminder_id: str,
    uid: str = Depends(_user_id_from_token),
):
    rid = (reminder_id or "").strip()
    if not rid:
        raise HTTPException(status_code=400, detail="Invalid id")
    try:
        doc = await visithon_collection.find_one({"_id": ObjectId(uid)}, {"reminders": 1})
    except (PyMongoError, ValueError) as exc:
        raise HTTPException(status_code=503, detail="Database error") from exc
    if not doc:
        raise HTTPException(status_code=404, detail="User not found")
    cur = doc.get("reminders") or []
    if not isinstance(cur, list):
        cur = []
    nxt = [x for x in cur if isinstance(x, dict) and str(x.get("id")) != rid]
    if len(nxt) == len(cur):
        raise HTTPException(status_code=404, detail="Reminder not found")
    try:
        await visithon_collection.update_one(
            {"_id": ObjectId(uid)},
            {"$set": {"reminders": nxt}},
        )
    except (PyMongoError, ValueError) as exc:
        raise HTTPException(status_code=503, detail="Database error") from exc
    return {"ok": True}
