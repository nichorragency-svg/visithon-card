from fastapi import APIRouter, Body, Depends, HTTPException
from bson import ObjectId
from database import visithon_collection
from ..wizard_utils import _user_id_from_token

router = APIRouter()

def _normalize_hours(raw) -> dict:
    """Haftay ke har din ke liye open/close timing set karna."""
    days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    out = {}
    if not isinstance(raw, dict): return {}
    
    for d in days:
        d_raw = raw.get(d)
        if isinstance(d_raw, dict):
            out[d] = {
                "is_closed": bool(d_raw.get("is_closed", False)),
                "open": (d_raw.get("open") or "09:00").strip(),
                "close": (d_raw.get("close") or "18:00").strip()
            }
        else:
            out[d] = {"is_closed": True, "open": "", "close": ""}
    return out

@router.patch("/step7")
async def save_step7(
    data: dict = Body(...),
    uid: str = Depends(_user_id_from_token),
):
    hours = _normalize_hours(data.get("business_hours"))
    try:
        await visithon_collection.update_one(
            {"_id": ObjectId(uid)},
            {
                "$set": {
                    "profile.step7.business_hours": hours,
                    "profile_format_version": 2
                }
            }
        )
    except Exception:
        raise HTTPException(status_code=503, detail="Database error")
    return {"ok": True}