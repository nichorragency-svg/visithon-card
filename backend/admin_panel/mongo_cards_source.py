"""
MongoDB-backed admin card directory (`visithon_cards`).

Router stays thin; add a parallel module (e.g. `supabase_cards_source.py`) later and
merge rows in the admin layer when Supabase sync is ready.
"""
from __future__ import annotations

from bson import ObjectId
from pymongo.errors import PyMongoError

from database import visithon_collection


def admin_row_from_visithon_doc(doc: dict) -> dict:
    """Shape expected by admin `CardManagementPage` (Mongo `visithon_cards`)."""
    oid = str(doc["_id"])
    cd = doc.get("card_details") if isinstance(doc.get("card_details"), dict) else {}
    profile = doc.get("profile") if isinstance(doc.get("profile"), dict) else {}
    s2 = profile.get("step2") if isinstance(profile.get("step2"), dict) else {}
    name = (
        (s2.get("full_name") or "").strip()
        or (doc.get("fullName") or "").strip()
        or (cd.get("name") or "").strip()
        or "N/A"
    )
    title = (
        (cd.get("role") or "").strip()
        or (s2.get("position") or "").strip()
        or "Digital card"
    )
    company = (s2.get("company") or "").strip() or (cd.get("company") or "").strip()
    avatar_path = (s2.get("avatar_url") or "").strip() or str(cd.get("profileImg") or "").strip()
    display_name = (cd.get("name") or "").strip() or name
    headline = company or display_name or title
    subline = name if headline != name else title
    views = int(doc.get("view_count") or doc.get("views") or 0)
    wa_taps = int(doc.get("whatsapp_taps") or doc.get("wa_clicks") or 0)
    raw = doc.get("status")
    if raw is None or raw == "":
        status = "active"
    else:
        status = str(raw).strip().lower() or "active"
    s1 = profile.get("step1") if isinstance(profile.get("step1"), dict) else {}
    plan_raw = str(s1.get("pricing_plan") or "").strip().lower()
    plan_labels = {"free": "Free Plan", "basic": "Basic Plan", "pro": "Pro Plan"}
    plan_label = plan_labels.get(plan_raw, (plan_raw.replace("_", " ").title() + " Plan") if plan_raw else "Free Plan")
    s6 = profile.get("step6") if isinstance(profile.get("step6"), dict) else {}
    phone = (s6.get("phone") or "").strip() or str(cd.get("phone1") or "").strip()
    email = str(doc.get("email") or (s6.get("email") or "")).strip()
    ca = doc.get("created_at")
    joined_at = ca.isoformat() if hasattr(ca, "isoformat") else str(ca or "")
    mongo_user_id = str(doc.get("user_id") or "").strip()
    return {
        "_id": oid,
        "user_id": mongo_user_id,
        "card_id": oid,
        "user": {"name": name},
        "cardTitle": title,
        "company": company,
        "headline": headline,
        "subline": subline,
        "avatar_path": avatar_path,
        "views": views,
        "whatsapp_taps": wa_taps,
        "status": status,
        "phone": phone,
        "email": email,
        "plan_label": plan_label,
        "joined_at": joined_at,
    }


async def list_mongo_admin_card_rows(limit: int = 500) -> list[dict]:
    cursor = visithon_collection.find({}).sort("created_at", -1)
    docs = await cursor.to_list(length=limit)
    return [admin_row_from_visithon_doc(d) for d in docs]


async def set_mongo_card_status(oid: ObjectId, new_status: str) -> bool:
    """Returns True if a document matched (caller validates new_status)."""
    result = await visithon_collection.update_one({"_id": oid}, {"$set": {"status": new_status}})
    return result.matched_count > 0
