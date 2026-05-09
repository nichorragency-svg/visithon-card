from fastapi import APIRouter, Body, Depends, HTTPException
from bson import ObjectId
from database import visithon_collection
from ..wizard_utils import _user_id_from_token

router = APIRouter()

@router.patch("/step8")
async def save_step8(
    data: dict = Body(...),
    uid: str = Depends(_user_id_from_token),
):
    gallery = data.get("gallery", [])
    if not isinstance(gallery, list):
        gallery = []

    # Filter out empty or invalid image URLs
    clean_gallery = [str(url).strip() for url in gallery if url and isinstance(url, str)]

    try:
        await visithon_collection.update_one(
            {"_id": ObjectId(uid)},
            {
                "$set": {
                    "profile.step8.gallery": clean_gallery[:15], # Limit to 15 images
                    "profile_format_version": 2
                }
            }
        )
    except Exception:
        raise HTTPException(status_code=503, detail="Database error")
    return {"ok": True, "count": len(clean_gallery)}