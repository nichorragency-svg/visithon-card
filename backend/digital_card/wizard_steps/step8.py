from fastapi import APIRouter, Body, Depends, HTTPException
from bson import ObjectId
from database import visithon_collection
from ..wizard_utils import _user_id_from_token

router = APIRouter()

_MAX_IMAGES = 24


def _normalize_gallery_images(raw) -> list:
    if not isinstance(raw, list):
        return []
    out = []
    for i, it in enumerate(raw[: _MAX_IMAGES]):
        if isinstance(it, str) and it.strip():
            out.append({"url": it.strip(), "name": "", "price": "", "id": f"g_{i}"})
        elif isinstance(it, dict):
            url = str(it.get("url") or it.get("src") or "").strip()
            if not url:
                continue
            out.append(
                {
                    "id": str(it.get("id") or f"g_{i}")[:80],
                    "url": url,
                    "name": str(it.get("name") or "")[:200],
                    "price": str(it.get("price") or "")[:80],
                }
            )
    return out


@router.patch("/step8")
async def save_step8(
    data: dict = Body(...),
    uid: str = Depends(_user_id_from_token),
):
    images = _normalize_gallery_images(data.get("images"))
    videos = data.get("videos") if isinstance(data.get("videos"), list) else []
    try:
        await visithon_collection.update_one(
            {"_id": ObjectId(uid)},
            {
                "$set": {
                    "profile.step8.images": images,
                    "profile.step8.videos": videos[:24],
                    "profile_format_version": 2,
                }
            },
        )
    except Exception:
        raise HTTPException(status_code=503, detail="Database error")
    return {"ok": True, "count": len(images)}
