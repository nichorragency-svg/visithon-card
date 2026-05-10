from __future__ import annotations

from datetime import date, datetime
from typing import Any

from bson import ObjectId
from fastapi import APIRouter, HTTPException

from database import themes_collection, visithon_collection

from digital_card.card_payload_helpers import (
    _MAX_GALLERY_IMAGES,
    _MAX_GALLERY_VIDEOS,
    _SOCIAL_KEYS,
    _merge_step1,
    _merge_step5,
    _merge_step6,
    _merge_step7,
    _normalize_gallery_items,
    _normalize_service_items,
)

router = APIRouter()


def _json_safe(value: Any) -> Any:
    """BSON / Mongo shapes (ObjectId, datetime, Decimal128, …) → JSON-serializable (avoids 500 on response)."""
    if value is None or isinstance(value, (bool, int, float, str)):
        return value
    if isinstance(value, ObjectId):
        return str(value)
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, dict):
        return {str(k): _json_safe(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_json_safe(v) for v in value]
    if isinstance(value, bytes):
        return value.decode("utf-8", errors="replace")
    try:
        from bson.decimal128 import Decimal128

        if isinstance(value, Decimal128):
            return str(value.to_decimal())
    except ImportError:
        pass
    return str(value)


def _public_card_payload(user_data: dict, uid_str: str) -> dict:
    """Merge legacy card_details with Visithon wizard profile for public + PWA card."""
    card = user_data.get("card_details") or {}
    profile = user_data.get("profile") or {}
    s1m = _merge_step1(profile.get("step1") if isinstance(profile.get("step1"), dict) else {})
    s2 = profile.get("step2") or {}
    s4 = profile.get("step4") or {}
    raw_items = s4.get("items") if isinstance(s4, dict) else []
    services = _normalize_service_items(raw_items if isinstance(raw_items, list) else [])

    s6 = _merge_step6(profile.get("step6"))
    s5 = _merge_step5(profile.get("step5"))
    s7 = _merge_step7(profile.get("step7")) if isinstance(profile.get("step7"), dict) else _merge_step7({})
    s8 = profile.get("step8") if isinstance(profile.get("step8"), dict) else {}
    gallery_images = _normalize_gallery_items(s8.get("images"), uid_str, _MAX_GALLERY_IMAGES)
    gallery_videos = _normalize_gallery_items(s8.get("videos"), uid_str, _MAX_GALLERY_VIDEOS)

    social: dict[str, str] = {}
    for k in _SOCIAL_KEYS:
        block = s5.get(k) or {}
        if block.get("enabled") and (block.get("url") or "").strip():
            social[k] = str(block.get("url")).strip()

    full_name = (s2.get("full_name") or "").strip() or (card.get("name") or "").strip() or "Visithon member"
    position = (s2.get("position") or "").strip() or (card.get("role") or "").strip()
    company = (s2.get("company") or "").strip() or (card.get("company") or "").strip()
    bio = (s2.get("bio") or "").strip()
    avatar_path = (s2.get("avatar_url") or "").strip()

    phone = (s6.get("phone") or "").strip() or (card.get("phone1") or "").strip()
    whatsapp = (s6.get("whatsapp") or "").strip() or (card.get("whatsapp") or "").strip()
    email = (s6.get("email") or "").strip() or (card.get("email") or "").strip()
    website = (s6.get("website") or "").strip() or (card.get("website") or "").strip()
    location = (s6.get("location") or "").strip() or (card.get("locationUrl") or "").strip()

    tagline_parts = [p for p in (position, company) if p]
    tagline = " • ".join(tagline_parts)

    products = user_data.get("products") or []
    if products is None:
        products = []
    payment_methods = user_data.get("payment_methods") or []
    if payment_methods is None:
        payment_methods = []

    return {
        "id": uid_str,
        "name": full_name,
        "role": position,
        "company": company,
        "bio": bio,
        "tagline": tagline,
        "avatar_static_path": avatar_path,
        "legacy_profile_img": (card.get("profileImg") or "").strip(),
        "coverImg": (card.get("coverImg") or "").strip(),
        "productBtnImage": card.get("productBtnImage", ""),
        "phone1": phone,
        "phone2": (card.get("phone2") or "").strip(),
        "whatsapp": whatsapp,
        "email": email,
        "website": website,
        "locationUrl": location,
        "location_text": location,
        "show_all_contacts": bool(s6.get("show_all_contacts", True)),
        "whatsapp_visible": bool(s6.get("whatsapp_visible", True)),
        "social": social,
        "services": services,
        "business_hours": s7,
        "gallery": {"images": gallery_images, "videos": gallery_videos},
        "products": products,
        "payment_methods": payment_methods,
        "profile": profile,
        "shop_portfolio_enabled": s1m.get("shop_portfolio_enabled"),
        "pricing_plan": s1m.get("pricing_plan") or "",
    }


@router.get("/card-view/{user_id}")
async def get_public_card(user_id: str):
    try:
        if not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=400, detail="Invalid ID format")

        user_data = await visithon_collection.find_one({"_id": ObjectId(user_id)})

        if not user_data:
            raise HTTPException(status_code=404, detail="Card Not Found!")

        uid_str = str(user_data["_id"])
        data = _public_card_payload(user_data, uid_str)
        selected_theme_id = str(((user_data.get("profile") or {}).get("step1") or {}).get("theme") or "").strip()
        if selected_theme_id:
            theme_doc = None
            try:
                theme_doc = await themes_collection.find_one(
                    {"layout_key": selected_theme_id},
                    {"layout_key": 1, "name": 1, "category": 1, "ui_tokens": 1, "is_active": 1},
                )
            except Exception as te:
                print(f"card-view theme lookup skipped: {te}")
            if theme_doc:
                data["selected_theme"] = {
                    "id": str(theme_doc.get("layout_key") or ""),
                    "name": str(theme_doc.get("name") or ""),
                    "category": str(theme_doc.get("category") or ""),
                    "is_active": bool(theme_doc.get("is_active", False)),
                    "ui_tokens": theme_doc.get("ui_tokens", {}) if isinstance(theme_doc.get("ui_tokens"), dict) else {},
                }

        return {"status": "success", "data": _json_safe(data)}
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Backend Error: {e}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}") from e
