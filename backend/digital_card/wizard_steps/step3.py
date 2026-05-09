from fastapi import APIRouter, Body, Depends, HTTPException
from bson import ObjectId
from database import visithon_collection, themes_collection
from ..wizard_utils import _user_id_from_token

router = APIRouter()

# Static catalog fallback
_THEME_IDS = {"professional", "elegant", "dark_modern", "minimal_light", "creative_vibrant", "nature_green"}

@router.patch("/step3")
async def save_step3(
    data: dict = Body(...),
    uid: str = Depends(_user_id_from_token),
):
    theme = (data.get("theme") or "").strip()
    valid_ids = set(_THEME_IDS)
    
    try:
        active = await themes_collection.find({"is_active": True}, {"layout_key": 1}).to_list(length=300)
        valid_ids.update(str(x.get("layout_key") or "").strip() for x in active)
    except Exception:
        pass

    if not theme or theme not in valid_ids:
        raise HTTPException(status_code=400, detail="Invalid or missing theme id")

    try:
        await visithon_collection.update_one(
            {"_id": ObjectId(uid)},
            {"$set": {"profile.step1.theme": theme, "profile_format_version": 2}},
        )
    except Exception:
        raise HTTPException(status_code=503, detail="Database error")
    return {"ok": True}