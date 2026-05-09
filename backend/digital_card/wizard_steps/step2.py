from fastapi import APIRouter, Body, Depends, HTTPException
from bson import ObjectId
from pymongo.errors import PyMongoError
from database import visithon_collection
from ..wizard_utils import _user_id_from_token

router = APIRouter()

@router.patch("/step2")
async def save_step2(
    data: dict = Body(...),
    uid: str = Depends(_user_id_from_token),
):
    full_name = (data.get("full_name") or "").strip()
    position = (data.get("position") or "").strip()
    company = (data.get("company") or "").strip()
    bio = (data.get("bio") or "").strip()

    if not full_name:
        raise HTTPException(status_code=400, detail="full_name is required")
    if len(bio) > 150:
        raise HTTPException(status_code=400, detail="bio must be at most 150 characters")

    try:
        await visithon_collection.update_one(
            {"_id": ObjectId(uid)},
            {
                "$set": {
                    "profile.step2.full_name": full_name,
                    "profile.step2.position": position,
                    "profile.step2.company": company,
                    "profile.step2.bio": bio,
                    "profile_format_version": 2,
                }
            },
        )
    except (PyMongoError, ValueError):
        raise HTTPException(status_code=503, detail="Database error")
    return {"ok": True}