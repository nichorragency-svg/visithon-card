import os
from fastapi import APIRouter, HTTPException, Body, status
from pymongo.errors import PyMongoError
from database import visithon_collection, user_collection
from jose import jwt
from datetime import datetime, timedelta
import random

from digital_card.security import hash_password, verify_password
from digital_card.visithon_card_templates import blank_visithon_card_document

# In-memory store for OTP (Consider Redis for production)
otp_store = {}

_DB_UNAVAILABLE = (
    "Could not connect to MongoDB. Please check your MONGO_URI in the backend/.env file. "
    "Ensure the URI is copied correctly from Atlas Drivers section."
)

router = APIRouter()

# --- Security Settings ---
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "VISITHON_CARD_SUPER_SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "1440"))


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def check_card_status(user_document):
    profile = user_document.get("profile", {})
    step1 = profile.get("step1", {})
    return bool(step1.get("profession"))


# --- 1. SIGNUP API (legacy: password on visithon_cards) ---
@router.post("/signup")
async def signup_visithon_user(data: dict = Body(...)):
    full_name = data.get("fullName")
    email = (data.get("email") or "").lower().strip()
    password = data.get("password")

    if not full_name or not email or not password:
        raise HTTPException(status_code=400, detail="Full Name, email, and password are required.")

    try:
        from digital_card.mongo_users_service import email_taken_anywhere

        if await email_taken_anywhere(email):
            raise HTTPException(status_code=400, detail="Email is already registered.")

        new_user = blank_visithon_card_document(
            full_name=full_name,
            email=email,
            legacy_password_hash=hash_password(password),
        )

        result = await visithon_collection.insert_one(new_user)
        uid = str(result.inserted_id)
        token = create_access_token({"sub": email, "id": uid})

        return {
            "status": "success",
            "message": "Account created successfully!",
            "token": token,
            "user": {
                "id": uid,
                "fullName": full_name,
                "email": email,
                "has_card": False,
            },
        }
    except HTTPException:
        raise
    except PyMongoError as exc:
        raise HTTPException(status_code=503, detail=_DB_UNAVAILABLE) from exc


# --- 1b. SIGNUP (Mongo `users` + linked visithon_cards) ---
@router.post("/users/signup")
async def signup_mongo_split_user(data: dict = Body(...)):
    full_name = str(data.get("fullName") or data.get("full_name") or "").strip()
    email = (data.get("email") or "").lower().strip()
    password = data.get("password") or ""

    if not full_name or not email or not password:
        raise HTTPException(status_code=400, detail="Full Name, email, and password are required.")

    try:
        from digital_card.mongo_users_service import create_visithon_user_with_card, email_taken_anywhere

        if await email_taken_anywhere(email):
            raise HTTPException(status_code=400, detail="Email is already registered.")

        _uid, cid = await create_visithon_user_with_card(full_name=full_name, email=email, password=password)
        token = create_access_token({"sub": email, "id": cid})
        return {
            "status": "success",
            "message": "Account created successfully!",
            "token": token,
            "user": {
                "id": cid,
                "fullName": full_name,
                "email": email,
                "has_card": False,
                "user_id": _uid,
            },
        }
    except HTTPException:
        raise
    except PyMongoError as exc:
        raise HTTPException(status_code=503, detail=_DB_UNAVAILABLE) from exc


# --- 2. LOGIN API ---
@router.post("/login")
async def login_visithon_user(data: dict = Body(...)):
    email = (data.get("email") or "").lower().strip()
    password = data.get("password")

    try:
        from digital_card.mongo_users_service import resolve_login_card

        user = await resolve_login_card(email, password)
    except HTTPException:
        raise
    except PyMongoError as exc:
        raise HTTPException(status_code=503, detail=_DB_UNAVAILABLE) from exc

    has_card = check_card_status(user)
    uid = str(user["_id"])
    token = create_access_token({"sub": email, "id": uid})

    return {
        "status": "success",
        "token": token,
        "user": {
            "id": uid,
            "fullName": user.get("fullName"),
            "email": user.get("email"),
            "has_card": has_card,
        },
    }


@router.post("/users/login")
async def login_mongo_alias(data: dict = Body(...)):
    """Same as POST /card-auth/login — alias for clients that namespace Mongo auth."""
    return await login_visithon_user(data)


# --- 3. REQUEST PASSWORD RESET ---
@router.post("/forgot-password")
async def forgot_password(data: dict = Body(...)):
    email = (data.get("email") or "").lower().strip()
    user = await visithon_collection.find_one({"email": email})
    if not user:
        user = await user_collection.find_one({"email": email, "visithon_card": True})

    if not user:
        raise HTTPException(status_code=404, detail="No account found with this email.")

    otp = str(random.randint(100000, 999999))
    otp_store[email] = otp

    print(f"\n********** OTP FOR {email}: {otp} **********\n")

    return {
        "status": "success",
        "message": "A reset code has been sent to your email. Please check your inbox.",
    }


# --- 4. VERIFY OTP & RESET PASSWORD ---
@router.post("/reset-password")
async def reset_password(data: dict = Body(...)):
    email = (data.get("email") or "").lower().strip()
    otp_input = data.get("otp")
    new_password = data.get("password")

    if email not in otp_store or otp_store[email] != otp_input:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP.")

    hashed_pw = hash_password(new_password)
    await visithon_collection.update_one({"email": email}, {"$set": {"password": hashed_pw}})
    await user_collection.update_one({"email": email, "visithon_card": True}, {"$set": {"password": hashed_pw}})

    if email in otp_store:
        del otp_store[email]

    return {"status": "success", "message": "Password updated successfully!"}
