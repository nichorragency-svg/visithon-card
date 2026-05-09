"""Upsert 6 premium multi-shade mobile-style themes into `visithon_themes`.

Each preset lives in `scripts/theme_presets/mobile_pro/*.json`.

Usage (from backend folder):
  python scripts/seed_mobile_pro_themes.py
"""
from __future__ import annotations

import asyncio
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

ROOT = Path(__file__).resolve().parents[1]
PRESETS_DIR = Path(__file__).resolve().parent / "theme_presets" / "mobile_pro"
load_dotenv(ROOT / ".env")

SOURCE = "preset-mobile-pro-v1"


def _preview_data_url(name: str, stops: list[str]) -> str:
    if len(stops) < 3:
        stops = (stops + [stops[-1]] * 3)[:3]
    a, b, c = stops[0], stops[1], stops[2]
    safe_name = (name or "Theme").replace("&", "and").replace("<", "").replace(">", "")[:42]
    svg = (
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 480 280'>"
        "<defs>"
        "<linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'>"
        f"<stop offset='0%' stop-color='{a}'/>"
        f"<stop offset='48%' stop-color='{b}'/>"
        f"<stop offset='100%' stop-color='{c}'/>"
        "</linearGradient>"
        "<linearGradient id='shine' x1='0' y1='0' x2='0' y2='1'>"
        "<stop offset='0%' stop-color='rgba(255,255,255,0.14)'/>"
        "<stop offset='35%' stop-color='rgba(255,255,255,0)'/>"
        "<stop offset='100%' stop-color='rgba(0,0,0,0.12)'/>"
        "</linearGradient>"
        "</defs>"
        "<rect width='480' height='280' rx='36' fill='url(#g)'/>"
        "<rect width='480' height='280' rx='36' fill='url(#shine)'/>"
        "<rect x='20' y='20' width='440' height='240' rx='28' fill='none' "
        "stroke='rgba(255,255,255,0.14)' stroke-width='1.2'/>"
        f"<text x='240' y='248' text-anchor='middle' font-family='system-ui,sans-serif' "
        f"font-size='12' font-weight='650' fill='rgba(255,255,255,0.88)'>{safe_name}</text>"
        "</svg>"
    )
    return "data:image/svg+xml;utf8," + quote(svg)


def _load_presets() -> list[dict]:
    paths = sorted(PRESETS_DIR.glob("*.json"))
    if not paths:
        raise RuntimeError(f"No JSON presets in {PRESETS_DIR}")
    out: list[dict] = []
    for p in paths:
        with p.open(encoding="utf-8") as f:
            out.append(json.load(f))
    return out


async def main() -> None:
    uri = os.getenv("MONGO_URI", "").strip()
    db_name = os.getenv("MONGO_DATABASE_NAME", "EventThon_Network").strip() or "EventThon_Network"
    if not uri:
        raise RuntimeError("MONGO_URI missing in backend/.env")
    client = AsyncIOMotorClient(uri, serverSelectionTimeoutMS=10_000)
    collection = client[db_name].get_collection("visithon_themes")
    now = datetime.now(timezone.utc)

    for raw in _load_presets():
        layout_key = str(raw.get("layout_key") or "").strip()
        if not layout_key:
            continue
        ui = raw.get("ui_tokens") if isinstance(raw.get("ui_tokens"), dict) else {}
        name = str(raw.get("name") or layout_key).strip()
        category = str(raw.get("category") or "creative").strip().lower()
        if category not in {"professional", "modern", "creative", "healthcare"}:
            category = "creative"
        grad = raw.get("preview_gradient")
        if isinstance(grad, list) and len(grad) >= 2:
            stops = [str(x) for x in grad[:3]]
        else:
            stops = [
                str(ui.get("shell_from") or "#0f172a"),
                str(ui.get("accent") or "#38bdf8"),
                str(ui.get("shell_to") or "#020617"),
            ]
        preview_url = _preview_data_url(name, stops)
        doc = {
            "layout_key": layout_key,
            "name": name,
            "category": category,
            "preview_url": preview_url,
            "source_url": SOURCE,
            "is_active": True,
            "ui_tokens": ui,
            "updated_at": now,
        }
        await collection.update_one(
            {"layout_key": layout_key},
            {"$set": doc, "$setOnInsert": {"created_at": now}},
            upsert=True,
        )
        print("Upserted:", layout_key)

    client.close()
    print("Done: mobile pro themes in visithon_themes.")


if __name__ == "__main__":
    asyncio.run(main())
