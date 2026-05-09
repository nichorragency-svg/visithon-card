from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- VISITHON CARD USER MODEL ---
class VisithonCardUser(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    username: str  # e.g. visithon.com/card/username

    card_data: Optional[Dict[str, Any]] = Field(default={
        "designation": "",
        "company": "",
        "bio": "",
        "social_links": {},
        "contact_numbers": [],
        "payment_methods": []
    })

    profile_img: Optional[str] = None
    cover_img: Optional[str] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "full_name": "Ammad Ul Hadi",
                "email": "ammad@example.com",
                "username": "ammad-dev",
                "card_data": {
                    "designation": "Software Developer",
                    "company": "Nichorr AI",
                    "social_links": {"linkedin": "link", "whatsapp": "number"}
                }
            }
        }
    )


class VisithonLoginSchema(BaseModel):
    email: EmailStr
    password: str


class VisithonSignupSchema(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    username: str


class Transaction(BaseModel):
    sender_email: str
    receiver_email: str
    amount: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    status: str = "completed"
