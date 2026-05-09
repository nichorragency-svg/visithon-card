from pydantic import BaseModel, EmailStr, Field
from typing import Optional

# --- User Signup ke liye ---
class UserCreate(BaseModel):
    first_name: str
    last_name: Optional[str] = ""
    email: EmailStr
    password: str  # Ab error nahi ayega
    mobile_number: str
    # Optional taake Visithon login flow crash na ho
    birth_day: Optional[int] = None
    birth_month: Optional[int] = None
    birth_year: Optional[int] = None
    gender: Optional[str] = None

# --- ID Verification (Agar baad mein karni ho) ---
class VerifyID(BaseModel):
    mobile_number: str
    id_card_number: str

# --- Login ke liye simple schema ---
class UserLogin(BaseModel):
    email: EmailStr
    password: str