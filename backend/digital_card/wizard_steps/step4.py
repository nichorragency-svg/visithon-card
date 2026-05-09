import uuid
from fastapi import APIRouter, Body, Depends, HTTPException
from bson import ObjectId
from database import visithon_collection
from ..wizard_utils import _user_id_from_token

router = APIRouter()

def _normalize_service_items(raw) -> list[dict]:
    if not isinstance(raw, list): return []
    out = []
    for it in raw[:35]:
        if not isinstance(it, dict): continue
        name = (it.get("name") or "").strip()
        if not name: continue
        iid = (it.get("id") or "").strip() or str(uuid.uuid4())
        out.append({"id": iid[:80], "name": name[:200]})
    return out

@router.patch("/step4")
async def save_step4(
    data: dict = Body(...),
    uid: str = Depends(_user_id_from_token),
):
    items = _normalize_service_items(data.get("items"))
    try:
        await visithon_collection.update_one(
            {"_id": ObjectId(uid)},
            {"$set": {"profile.step4.items": items, "profile_format_version": 2}},
        )
    except Exception:
        raise HTTPException(status_code=503, detail="Database error")
    return {"ok": True, "items": items}