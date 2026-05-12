"""Admin REST API — verifies against `admins` collection only."""
from __future__ import annotations

import os
from datetime import datetime, timedelta

import bcrypt
from bson import ObjectId
from fastapi import APIRouter, Body, Depends, HTTPException
from jose import jwt
from pymongo.errors import PyMongoError

from digital_card.card_auth import hash_password
from database import admins_collection, themes_collection
from admin_panel.mongo_cards_source import list_mongo_admin_card_rows, set_mongo_card_status
from admin_panel.auth_deps import ADMIN_SECRET, ADMIN_ALGORITHM, admin_from_token

router = APIRouter()

ADMIN_TOKEN_EXPIRE_MINUTES = int(os.getenv("ADMIN_JWT_EXPIRE_MINUTES", str(60 * 8)))
ADMIN_REGISTER_PUBLIC = os.getenv("ADMIN_REGISTER_PUBLIC", "false").strip().lower() in (
    "1",
    "true",
    "yes",
)

# Mirrors card bcrypt format (utf-8 string hashes)
def _verify_password(plain: str, hashed: str) -> bool:
    if not plain or not hashed:
        return False
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def _admin_token(admin_id: str, email: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=ADMIN_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": "admin", "role": "admin", "admin_id": admin_id, "email": email, "exp": expire}
    return jwt.encode(payload, ADMIN_SECRET, algorithm=ADMIN_ALGORITHM)


@router.post("/login")
async def admin_login(data: dict = Body(...)):
    email = str(data.get("email") or "").lower().strip()
    password = str(data.get("password") or "")
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password are required")
    try:
        doc = await admins_collection.find_one({"email": email})
    except PyMongoError as exc:
        raise HTTPException(status_code=503, detail="Database error") from exc
    if not doc or not doc.get("password"):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not _verify_password(password, str(doc["password"])):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    admin_id = str(doc["_id"])
    token = _admin_token(admin_id, email)
    return {"access_token": token, "token_type": "bearer", "email": email}


@router.post("/register")
async def admin_register(data: dict = Body(...)):
    """
    Disabled unless ADMIN_REGISTER_PUBLIC=true (use scripts/create_visithon_admin.py by default).

    First admin: no bootstrap secret required when collection is empty and public register is enabled.
    More admins: ADMIN_BOOTSTRAP_SECRET + bootstrap_secret in body.
    """
    if not ADMIN_REGISTER_PUBLIC:
        raise HTTPException(
            status_code=403,
            detail=(
                "Self-service admin registration is disabled. "
                "Set ADMIN_REGISTER_PUBLIC=true on the API server temporarily, or create/reset admins with "
                "python scripts/create_visithon_admin.py"
            ),
        )

    email = str(data.get("email") or "").lower().strip()
    password = str(data.get("password") or "")
    name = str(data.get("name") or "").strip()
    bootstrap_secret = str(data.get("bootstrap_secret") or "")
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password are required")
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    try:
        count = await admins_collection.count_documents({})
    except PyMongoError as exc:
        raise HTTPException(status_code=503, detail="Database error") from exc

    env_bootstrap = os.getenv("ADMIN_BOOTSTRAP_SECRET", "").strip()
    if count > 0:
        if not env_bootstrap or bootstrap_secret != env_bootstrap:
            raise HTTPException(
                status_code=403,
                detail="Admin already exists. Set ADMIN_BOOTSTRAP_SECRET server-side and send bootstrap_secret, or use scripts/create_visithon_admin.py.",
            )

    try:
        if await admins_collection.find_one({"email": email}):
            raise HTTPException(status_code=400, detail="This email is already an admin")
        doc = {
            "email": email,
            "password": hash_password(password),
            "name": name or email.split("@")[0],
            "created_at": datetime.utcnow(),
        }
        res = await admins_collection.insert_one(doc)
    except HTTPException:
        raise
    except PyMongoError as exc:
        raise HTTPException(status_code=503, detail="Database error") from exc

    admin_id = str(res.inserted_id)
    token = _admin_token(admin_id, email)
    return {"access_token": token, "token_type": "bearer", "email": email}


@router.get("/me")
async def admin_me(payload: dict = Depends(admin_from_token)):
    return {"ok": True, "role": "admin", "email": payload.get("email"), "admin_id": payload.get("admin_id")}


def _theme_doc(doc: dict) -> dict:
    return {
        "_id": str(doc["_id"]),
        "name": doc.get("name", ""),
        "category": doc.get("category", ""),
        "preview_url": doc.get("preview_url", ""),
        "is_active": bool(doc.get("is_active", False)),
        "source_url": doc.get("source_url", ""),
        "layout_key": doc.get("layout_key", ""),
        "ui_tokens": doc.get("ui_tokens", {}) if isinstance(doc.get("ui_tokens"), dict) else {},
        "created_at": doc.get("created_at"),
        "updated_at": doc.get("updated_at"),
    }


@router.get("/themes")
async def list_themes(_: dict = Depends(admin_from_token)):
    try:
        cursor = themes_collection.find({}).sort("created_at", -1)
        docs = await cursor.to_list(length=200)
    except PyMongoError as exc:
        raise HTTPException(status_code=503, detail="Database error") from exc
    return {"items": [_theme_doc(d) for d in docs]}


@router.post("/themes")
async def create_theme(data: dict = Body(...), _: dict = Depends(admin_from_token)):
    name = str(data.get("name") or "").strip()
    category = str(data.get("category") or "").strip()
    preview_url = str(data.get("preview_url") or "").strip()
    if not name or not category or not preview_url:
        raise HTTPException(status_code=400, detail="name, category and preview_url are required")
    now = datetime.utcnow()
    payload = {
        "name": name,
        "category": category,
        "preview_url": preview_url,
        "is_active": bool(data.get("is_active", False)),
        "source_url": str(data.get("source_url") or "").strip(),
        "layout_key": str(data.get("layout_key") or "").strip(),
        "ui_tokens": data.get("ui_tokens") if isinstance(data.get("ui_tokens"), dict) else {},
        "created_at": now,
        "updated_at": now,
    }
    try:
        res = await themes_collection.insert_one(payload)
        doc = await themes_collection.find_one({"_id": res.inserted_id})
    except PyMongoError as exc:
        raise HTTPException(status_code=503, detail="Database error") from exc
    if not doc:
        raise HTTPException(status_code=500, detail="Theme create failed")
    return _theme_doc(doc)


@router.patch("/themes/{theme_id}")
async def update_theme(theme_id: str, data: dict = Body(...), _: dict = Depends(admin_from_token)):
    try:
        oid = ObjectId(theme_id)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid theme id") from exc
    update_fields = {}
    for key in ("name", "category", "preview_url", "source_url", "layout_key"):
        if key in data and data.get(key) is not None:
            update_fields[key] = str(data.get(key)).strip()
    if "ui_tokens" in data and isinstance(data.get("ui_tokens"), dict):
        update_fields["ui_tokens"] = data.get("ui_tokens")
    if "is_active" in data:
        update_fields["is_active"] = bool(data.get("is_active"))
    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields to update")
    update_fields["updated_at"] = datetime.utcnow()
    try:
        result = await themes_collection.update_one({"_id": oid}, {"$set": update_fields})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Theme not found")
        doc = await themes_collection.find_one({"_id": oid})
    except HTTPException:
        raise
    except PyMongoError as exc:
        raise HTTPException(status_code=503, detail="Database error") from exc
    if not doc:
        raise HTTPException(status_code=404, detail="Theme not found")
    return _theme_doc(doc)


@router.delete("/themes/{theme_id}")
async def delete_theme(theme_id: str, _: dict = Depends(admin_from_token)):
    try:
        oid = ObjectId(theme_id)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid theme id") from exc
    try:
        result = await themes_collection.delete_one({"_id": oid})
    except PyMongoError as exc:
        raise HTTPException(status_code=503, detail="Database error") from exc
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Theme not found")
    return {"ok": True, "deleted_id": theme_id}


@router.get("/all-cards")
async def get_all_cards(_: dict = Depends(admin_from_token)):
    try:
        return await list_mongo_admin_card_rows(500)
    except PyMongoError as exc:
        raise HTTPException(status_code=503, detail="Database error") from exc


@router.patch("/card-status/{card_id}")
async def update_card_status(card_id: str, data: dict = Body(...), _: dict = Depends(admin_from_token)):
    new_status = str(data.get("status") or "").strip().lower()
    if new_status not in ("active", "rejected", "pending"):
        raise HTTPException(status_code=400, detail="status must be active, rejected, or pending")
    try:
        oid = ObjectId(card_id)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid card id") from exc
    try:
        ok = await set_mongo_card_status(oid, new_status)
    except PyMongoError as exc:
        raise HTTPException(status_code=503, detail="Database error") from exc
    if not ok:
        raise HTTPException(status_code=404, detail="Card not found")
    return {"success": True, "message": f"Card {new_status} successfully"}