"""Visithon card holders stored in MongoDB `users` + `visithon_cards.user_id` link."""
from __future__ import annotations

import os
from datetime import datetime

from fastapi import HTTPException
from pymongo.errors import DuplicateKeyError, PyMongoError

from database import user_collection, visithon_collection
from digital_card.security import hash_password, verify_password
from digital_card.visithon_card_templates import blank_visithon_card_document

_INDEXES_ENSURED = False


def _mongo_fail_detail(exc: BaseException) -> str:
    base = (
        "MongoDB error: check MONGO_URI, MONGO_DATABASE_NAME, and Atlas Network Access "
        "(add this server's public IP). If the API runs in Docker, use host.docker.internal or the correct host."
    )
    if os.getenv("VISITHON_DEBUG_DB", "").strip().lower() in ("1", "true", "yes"):
        return f"{base} [{type(exc).__name__}: {str(exc)[:220]}]"
    return base


def _mongo_503(exc: BaseException) -> HTTPException:
    return HTTPException(status_code=503, detail=_mongo_fail_detail(exc))


async def ensure_visithon_user_indexes() -> None:
    global _INDEXES_ENSURED
    if _INDEXES_ENSURED:
        return
    try:
        await user_collection.create_index(
            [("email", 1)],
            unique=True,
            partialFilterExpression={"visithon_card": True},
            name="visithon_card_user_email_uq",
        )
    except Exception:
        # Index may already exist with different options, or server version limits — do not block signups
        pass
    try:
        await visithon_collection.create_index("user_id", name="visithon_cards_user_id")
    except Exception:
        pass
    _INDEXES_ENSURED = True


async def email_taken_anywhere(email: str) -> bool:
    try:
        if await user_collection.find_one({"email": email, "visithon_card": True}):
            return True
        if await visithon_collection.find_one({"email": email}):
            return True
        return False
    except PyMongoError as exc:
        raise _mongo_503(exc) from exc


async def create_visithon_user_with_card(*, full_name: str, email: str, password: str) -> tuple[str, str]:
    """Returns (mongo_user_id_hex, card_id_hex)."""
    await ensure_visithon_user_indexes()
    hp = hash_password(password)
    udoc = {
        "email": email,
        "password": hp,
        "full_name": full_name.strip(),
        "status": "active",
        "created_at": datetime.utcnow(),
        "visithon_card": True,
    }
    try:
        ur = await user_collection.insert_one(udoc)
    except DuplicateKeyError as exc:
        raise HTTPException(status_code=400, detail="Email is already registered.") from exc
    except PyMongoError as exc:
        raise _mongo_503(exc) from exc

    uid_str = str(ur.inserted_id)
    cdoc = blank_visithon_card_document(full_name=full_name, email=email, user_id=uid_str)
    try:
        cr = await visithon_collection.insert_one(cdoc)
    except PyMongoError as exc:
        await user_collection.delete_one({"_id": ur.inserted_id})
        raise HTTPException(
            status_code=503,
            detail=_mongo_fail_detail(exc) + " (rolled back user row)",
        ) from exc
    return uid_str, str(cr.inserted_id)


async def resolve_login_card(email: str, password: str) -> dict:
    """
    Legacy card doc (password on visithon_cards) OR app user (password on users, card linked by user_id).
    Returns visithon_cards document for JWT `id` (card _id).
    """
    try:
        legacy = await visithon_collection.find_one({"email": email})
    except PyMongoError as exc:
        raise _mongo_503(exc) from exc

    if legacy and legacy.get("password") and verify_password(password, str(legacy["password"])):
        return legacy

    try:
        app_user = await user_collection.find_one({"email": email, "visithon_card": True})
    except PyMongoError as exc:
        raise _mongo_503(exc) from exc

    if not app_user or not app_user.get("password"):
        raise HTTPException(status_code=401, detail="Invalid Email or Password.")

    if not verify_password(password, str(app_user["password"])):
        raise HTTPException(status_code=401, detail="Invalid Email or Password.")

    uid_str = str(app_user["_id"])
    try:
        card = await visithon_collection.find_one({"user_id": uid_str})
    except PyMongoError as exc:
        raise _mongo_503(exc) from exc

    if not card:
        raise HTTPException(status_code=401, detail="Invalid Email or Password.")
    return card
