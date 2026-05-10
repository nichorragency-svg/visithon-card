"""Shared normalizers for legacy Mongo `card_view` payload (mirrors frontend cardPayload.js)."""
from __future__ import annotations

from typing import Any

_MAX_GALLERY_IMAGES = 24
_MAX_GALLERY_VIDEOS = 24
_SOCIAL_KEYS = ("facebook", "instagram", "linkedin", "youtube", "twitter", "custom")
_STEP7_DAYS = (
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
)


def _merge_step1(s1: Any) -> dict:
    s = s1 if isinstance(s1, dict) else {}
    spe = s.get("shop_portfolio_enabled")
    if spe is True:
        spe_out: bool | None = True
    elif spe is False:
        spe_out = False
    else:
        spe_out = None
    return {
        "profession": str(s.get("profession") or "").strip(),
        "shop_portfolio_enabled": spe_out,
        "pricing_plan": str(s.get("pricing_plan") or "").strip(),
        "theme": str(s.get("theme") or "").strip(),
    }


def _merge_step5(blob: Any) -> dict:
    b = blob if isinstance(blob, dict) else {}
    out: dict[str, dict] = {}
    for k in _SOCIAL_KEYS:
        block = b.get(k)
        if isinstance(block, dict):
            out[k] = {
                "enabled": bool(block.get("enabled")),
                "url": str(block.get("url") or "").strip()[:500],
            }
        else:
            out[k] = {"enabled": False, "url": ""}
    return out


def _merge_step6(blob: Any) -> dict:
    b = blob if isinstance(blob, dict) else {}
    return {
        "phone": str(b.get("phone") or "").strip()[:240],
        "whatsapp": str(b.get("whatsapp") or "").strip()[:240],
        "whatsapp_visible": b.get("whatsapp_visible") is not False,
        "email": str(b.get("email") or "").strip()[:240],
        "website": str(b.get("website") or "").strip()[:240],
        "location": str(b.get("location") or "").strip()[:240],
        "show_all_contacts": b.get("show_all_contacts") is not False,
    }


def _merge_step7(s7: Any) -> dict:
    s = s7 if isinstance(s7, dict) else {}
    out: dict[str, dict] = {}
    for i, key in enumerate(_STEP7_DAYS):
        def_open = "09:00"
        def_close = "17:00"
        default_enabled = i < 5
        row = s.get(key)
        if isinstance(row, dict):
            out[key] = {
                "enabled": bool(row.get("enabled")),
                "open": str(row.get("open") or def_open).strip()[:8] or def_open,
                "close": str(row.get("close") or def_close).strip()[:8] or def_close,
            }
        else:
            bh = s.get("business_hours") if isinstance(s.get("business_hours"), dict) else {}
            bw = bh.get(key) if isinstance(bh, dict) else None
            if isinstance(bw, dict):
                out[key] = {
                    "enabled": not bool(bw.get("is_closed")),
                    "open": str(bw.get("open") or def_open),
                    "close": str(bw.get("close") or "18:00"),
                }
            else:
                out[key] = {
                    "enabled": default_enabled,
                    "open": def_open,
                    "close": def_close,
                }
    return out


def _normalize_service_items(raw: Any) -> list[dict]:
    lst = raw if isinstance(raw, list) else []
    out: list[dict] = []
    for i, it in enumerate(lst[:35]):
        if not isinstance(it, dict):
            continue
        name = str(it.get("name") or "").strip()
        if not name:
            continue
        sid = str(it.get("id") or "").strip()[:80] or f"srv_{len(out)}"
        out.append({"id": sid, "name": name[:200]})
    return out


def _normalize_gallery_items(raw: Any, _uid_str: str, max_n: int) -> list[dict]:
    lst = raw if isinstance(raw, list) else []
    out: list[dict] = []
    for i, item in enumerate(lst[:max_n]):
        if isinstance(item, str) and item.strip():
            out.append({"url": item.strip(), "caption": "", "order": i})
        elif isinstance(item, dict) and isinstance(item.get("url"), str) and item["url"].strip():
            out.append(
                {
                    "url": item["url"].strip(),
                    "caption": str(item.get("name") or item.get("caption") or ""),
                    "order": i,
                }
            )
    return out
