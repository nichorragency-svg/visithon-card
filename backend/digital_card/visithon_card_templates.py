"""Default `visithon_cards` document shape — shared by legacy card_auth signup and Mongo `users` + card flow."""
from __future__ import annotations

from datetime import datetime


def blank_visithon_card_document(
    *,
    full_name: str,
    email: str,
    user_id: str | None = None,
    legacy_password_hash: str | None = None,
) -> dict:
    """
    New card row. Either:
    - Legacy: `legacy_password_hash` set, no `user_id` (password stored on card doc).
    - Split: `user_id` set (Mongo `users._id` hex), no password on card (auth via `users`).
    """
    doc: dict = {
        "fullName": full_name,
        "email": email,
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
                "phone": "",
                "whatsapp": "",
                "whatsapp_visible": True,
                "email": "",
                "website": "",
                "location": "",
                "show_all_contacts": True,
            },
            "step7": {},
            "step8": {"images": [], "videos": []},
        },
        "reminders": [],
    }
    if user_id is not None:
        doc["user_id"] = user_id
    if legacy_password_hash is not None:
        doc["password"] = legacy_password_hash
    return doc
