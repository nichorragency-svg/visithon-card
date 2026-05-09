from fastapi import APIRouter, Body, Depends, HTTPException
from bson import ObjectId
from database import visithon_collection
from ..wizard_utils import _user_id_from_token

router = APIRouter()

def _normalize_social(raw) -> list[dict]:
    """Sirf valid aur non-empty links ko filter karta hy."""
    if not isinstance(raw, list): return []
    out = []
    for it in raw[:20]: # Limit to 20 links
        if not isinstance(it, dict): continue
        platform = (it.get("platform") or "").strip().lower()
        url = (it.get("url") or "").strip()
        if platform and url:
            out.append({"platform": platform, "url": url})
    return out

@router.patch("/step5")
async def save_step5(
    data: dict = Body(...),
    uid: str = Depends(_user_id_from_token),
):
    social_links = _normalize_social(data.get("social_links"))
    
    try:
        await visithon_collection.update_one(
            {"_id": ObjectId(uid)},
            {
                "$set": {
                    "profile.step5.social_links": social_links,
                    "profile_format_version": 2
                }
            }
        )
    except Exception:
        raise HTTPException(status_code=503, detail="Database error")
    
    return {"ok": True, "count": len(social_links)}