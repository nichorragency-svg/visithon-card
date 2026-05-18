from fastapi import APIRouter, Body, Depends, HTTPException
from bson import ObjectId
from database import visithon_collection
from ..wizard_utils import _user_id_from_token

router = APIRouter()

_SOCIAL_KEYS = ("facebook", "instagram", "linkedin", "youtube", "twitter", "custom")


def _normalize_step5_blob(data: dict) -> dict:
    """Accept { facebook: {enabled, url}, ... } or legacy { social_links: [...] }."""
    if not isinstance(data, dict):
        return {}
    out = {}
    for k in _SOCIAL_KEYS:
        block = data.get(k)
        if isinstance(block, dict):
            out[k] = {
                "enabled": bool(block.get("enabled")),
                "url": str(block.get("url") or "").strip()[:500],
            }
        else:
            out[k] = {"enabled": False, "url": ""}
    return out


@router.patch("/step5")
async def save_step5(
    data: dict = Body(...),
    uid: str = Depends(_user_id_from_token),
):
    blob = _normalize_step5_blob(data)
    try:
        await visithon_collection.update_one(
            {"_id": ObjectId(uid)},
            {"$set": {"profile.step5": blob, "profile_format_version": 2}},
        )
    except Exception:
        raise HTTPException(status_code=503, detail="Database error")
    return {"ok": True}
