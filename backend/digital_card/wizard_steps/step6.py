from fastapi import APIRouter, Body, Depends, HTTPException
from bson import ObjectId
from database import visithon_collection
from ..wizard_utils import _user_id_from_token

router = APIRouter()


@router.patch("/step6")
async def save_step6(
    data: dict = Body(...),
    uid: str = Depends(_user_id_from_token),
):
    email = (data.get("email") or "").strip().lower()
    phone = (data.get("phone") or "").strip()
    whatsapp = (data.get("whatsapp") or "").strip()
    website = (data.get("website") or "").strip()
    location = (data.get("location") or data.get("address") or "").strip()
    whatsapp_visible = data.get("whatsapp_visible") is not False
    show_all = data.get("show_all_contacts") is not False

    if not email and not phone:
        raise HTTPException(status_code=400, detail="At least Email or Phone is required")

    try:
        await visithon_collection.update_one(
            {"_id": ObjectId(uid)},
            {
                "$set": {
                    "profile.step6.email": email,
                    "profile.step6.phone": phone,
                    "profile.step6.whatsapp": whatsapp,
                    "profile.step6.whatsapp_visible": whatsapp_visible,
                    "profile.step6.website": website,
                    "profile.step6.location": location,
                    "profile.step6.show_all_contacts": show_all,
                    "profile_format_version": 2,
                }
            },
        )
    except Exception:
        raise HTTPException(status_code=503, detail="Database error")

    return {"ok": True}
