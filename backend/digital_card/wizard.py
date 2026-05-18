import os
import shutil
import time
from datetime import datetime

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from bson import ObjectId
from database import visithon_collection, themes_collection
from .wizard_utils import _user_id_from_token
from .wizard_steps import (
    step1, step2, step3, step4, step5, 
    step6, step7, step8, step9
)

router = APIRouter()

# --- STEP ROUTERS INCLUDE ---
# Humne har step ko uske prefix ke sath attach kar diya hy
router.include_router(step1.router, prefix="/wizard", tags=["Step 1"])
router.include_router(step2.router, prefix="/wizard", tags=["Step 2"])
router.include_router(step3.router, prefix="/wizard", tags=["Step 3"])
router.include_router(step4.router, prefix="/wizard", tags=["Step 4"])
router.include_router(step5.router, prefix="/wizard", tags=["Step 5"])
router.include_router(step6.router, prefix="/wizard", tags=["Step 6"])
router.include_router(step7.router, prefix="/wizard", tags=["Step 7"])
router.include_router(step8.router, prefix="/wizard", tags=["Step 8"])
# Step 9 ka route frontend k mutabiq card-auth ya wizard k sath adjust ho skta hy
router.include_router(step9.router, prefix="/card-auth", tags=["Step 9"])

_UPLOAD_ROOT = os.path.join("uploads", "digital_cards")
os.makedirs(_UPLOAD_ROOT, exist_ok=True)


@router.get("/themes")
async def list_wizard_themes():
    """Active themes for wizard step 3 (no admin token required)."""
    try:
        cursor = themes_collection.find({"is_active": True}).sort("created_at", -1)
        docs = await cursor.to_list(length=200)
    except Exception:
        docs = []
    themes = [
        {
            "id": str(d.get("layout_key") or ""),
            "name": d.get("name") or d.get("layout_key"),
            "subtitle": str(d.get("category") or ""),
            "category": d.get("category") or "professional",
            "preview_url": d.get("preview_url") or "",
        }
        for d in docs
        if d.get("layout_key")
    ]
    return {"themes": themes}


@router.post("/upload")
async def upload_wizard_media(
    file: UploadFile = File(...),
    kind: str = Form("image"),
    uid: str = Depends(_user_id_from_token),
):
    """Avatar / gallery uploads — served under /static/digital_cards/…"""
    ext = (file.filename or "file").rsplit(".", 1)[-1].lower() if file.filename else "jpg"
    if ext not in ("jpg", "jpeg", "png", "webp", "gif", "mp4", "webm"):
        ext = "jpg"
    sub = "avatar" if kind == "avatar" else "gallery"
    fname = f"{sub}_{uid}_{int(time.time() * 1000)}.{ext}"
    dest = os.path.join(_UPLOAD_ROOT, fname)
    with open(dest, "wb") as out:
        shutil.copyfileobj(file.file, out)
    rel = f"digital_cards/{fname}"
    if kind == "avatar":
        await visithon_collection.update_one(
            {"_id": ObjectId(uid)},
            {"$set": {"profile.step2.avatar_url": rel, "profile_format_version": 2}},
        )
    return {"ok": True, "url": rel, "id": fname}


# --- SHARED WIZARD ENDPOINTS ---

@router.get("/wizard/state")
async def get_wizard_full_state(uid: str = Depends(_user_id_from_token)):
    try:
        user_data = await visithon_collection.find_one(
            {"_id": ObjectId(uid)},
            # Yeh teeno fields lazmi mangwani hain
            {"profile": 1, "wizard_completed": 1, "is_published": 1}
        )
        
        if not user_data:
            return {"ok": False, "profile": {}, "wizard_completed": False}
            
        return {
            "ok": True,
            "profile": user_data.get("profile", {}),
            # Agar DB mein field na ho toh default False bhejain
            "wizard_completed": user_data.get("wizard_completed", False),
            "is_published": user_data.get("is_published", False)
        }
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.get("/wizard/reset")
async def reset_wizard_progress(uid: str = Depends(_user_id_from_token)):
    """Agar user dobara shuru se wizard bharna chahay."""
    try:
        await visithon_collection.update_one(
            {"_id": ObjectId(uid)},
            {"$set": {"profile": {}, "wizard_completed": False}}
        )
        return {"ok": True, "message": "Wizard progress has been reset"}
    except Exception:
        raise HTTPException(status_code=500, detail="Could not reset progress")