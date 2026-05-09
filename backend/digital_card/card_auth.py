import os
from fastapi import APIRouter, HTTPException, Body, status
from pymongo.errors import PyMongoError
from database import visithon_collection
import bcrypt
from jose import jwt
from datetime import datetime, timedelta
import random

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

# Helper: Password Hashing
def hash_password(password: str):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

# Helper: Password Verification
def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

# Helper: JWT Token Creation
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Helper: Check if User has completed their card
def check_card_status(user_document):
    """
    Checks if the card is considered 'created'. 
    Logic: If step1 profession or pricing_plan is set, we assume they started.
    Adjust this logic based on your specific 'Completion' criteria.
    """
    profile = user_document.get("profile", {})
    step1 = profile.get("step1", {})
    # If step 1 is filled, we consider the card process initiated/exists
    return bool(step1.get("profession"))

# --- 1. SIGNUP API ---
@router.post("/signup")
async def signup_visithon_user(data: dict = Body(...)):
    full_name = data.get("fullName")
    email = (data.get("email") or "").lower().strip()
    password = data.get("password")
    
    if not full_name or not email or not password:
        raise HTTPException(status_code=400, detail="Full Name, email, and password are required.")

    try:
        user_exists = await visithon_collection.find_one({"email": email})
        if user_exists:
            raise HTTPException(status_code=400, detail="Email is already registered.")

        new_user = {
            "fullName": full_name,
            "email": email,
            "password": hash_password(password),
            "username": email.split("@")[0],
            "card_data": {},
            "profileImg": "",
            "coverImg": "",
            "created_at": datetime.utcnow(),
            "profile_format_version": 2,
            "profile": {
                "step1": {"profession": "", "theme": "", "shop_portfolio_enabled": None, "pricing_plan": ""},
                "step2": {"full_name": "", "position": "", "company": "", "bio": "", "avatar_url": ""},
                "step4": {"items": []},
                "step5": {
                    "facebook": {"enabled": False, "url": ""},
                    "instagram": {"enabled": False, "url": ""},
                    "linkedin": {"enabled": False, "url": ""},
                    "youtube": {"enabled": False, "url": ""},
                    "twitter": {"enabled": False, "url": ""},
                    "custom": {"enabled": False, "url": ""},
                },
                "step6": {
                    "phone": "", "whatsapp": "", "whatsapp_visible": True,
                    "email": "", "website": "", "location": "", "show_all_contacts": True,
                },
                "step7": {},
                "step8": {"images": [], "videos": []},
            },
            "reminders": [],
        }

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
                "has_card": False # New users always start without a card
            },
        }
    except PyMongoError as exc:
        raise HTTPException(status_code=503, detail=_DB_UNAVAILABLE) from exc

# --- 2. LOGIN API ---
@router.post("/login")
async def login_visithon_user(data: dict = Body(...)):
    email = (data.get("email") or "").lower().strip()
    password = data.get("password")

    try:
        user = await visithon_collection.find_one({"email": email})
    except PyMongoError as exc:
        raise HTTPException(status_code=503, detail=_DB_UNAVAILABLE) from exc

    if not user or not verify_password(password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid Email or Password.")

    # Check if the user has already set up their card
    has_card = check_card_status(user)

    # Generate Token
    uid = str(user["_id"])
    token = create_access_token({"sub": email, "id": uid})

    return {
        "status": "success",
        "token": token,
        "user": {
            "id": uid,
            "fullName": user.get("fullName"),
            "email": user.get("email"),
            "has_card": has_card # This flag controls the frontend redirect
        }
    }

# --- 3. REQUEST PASSWORD RESET ---
@router.post("/forgot-password")
async def forgot_password(data: dict = Body(...)):
    email = (data.get("email") or "").lower().strip()
    user = await visithon_collection.find_one({"email": email})
    
    if not user:
        raise HTTPException(status_code=404, detail="No account found with this email.")

    otp = str(random.randint(100000, 999999))
    otp_store[email] = otp 
    
    # Log OTP for development
    print(f"\n********** OTP FOR {email}: {otp} **********\n")
    
    return {
        "status": "success", 
        "message": "A reset code has been sent to your email. Please check your inbox."
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
    await visithon_collection.update_one(
        {"email": email},
        {"$set": {"password": hashed_pw}}
    )

    if email in otp_store:
        del otp_store[email]

    return {"status": "success", "message": "Password updated successfully!"}