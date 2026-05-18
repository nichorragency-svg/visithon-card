from fastapi import APIRouter, Body, Depends, HTTPException
from bson import ObjectId
from database import visithon_collection
from ..wizard_utils import _user_id_from_token

router = APIRouter()

_DAYS = ("monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday")


def _normalize_schedule(raw: dict) -> dict:
    schedule = raw.get("schedule") if isinstance(raw.get("schedule"), dict) else raw
    if not isinstance(schedule, dict):
        schedule = {}
    out = {}
    for i, d in enumerate(_DAYS):
        row = schedule.get(d)
        if isinstance(row, dict):
            out[d] = {
                "enabled": bool(row.get("enabled")),
                "open": str(row.get("open") or "09:00").strip()[:8],
                "close": str(row.get("close") or "17:00").strip()[:8],
            }
        else:
            out[d] = {"enabled": i < 5, "open": "09:00", "close": "17:00"}
    return out


@router.patch("/step7")
async def save_step7(
    data: dict = Body(...),
    uid: str = Depends(_user_id_from_token),
):
    hours = _normalize_schedule(data if isinstance(data, dict) else {})
    sets = {f"profile.step7.{d}": hours[d] for d in _DAYS}
    sets["profile_format_version"] = 2
    try:
        await visithon_collection.update_one({"_id": ObjectId(uid)}, {"$set": sets})
    except Exception:
        raise HTTPException(status_code=503, detail="Database error")
    return {"ok": True}
