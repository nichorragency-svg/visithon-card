"""Upsert two doctor-style reference themes into `visithon_themes`.

Usage:
  python scripts/seed_reference_themes.py
"""
from __future__ import annotations

import asyncio
import os
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

ROOT = Path(__file__).resolve().parents[1]
load_dotenv(ROOT / ".env")


THEMES = [
    {
        "layout_key": "doctor-molecule-glow",
        "name": "Doctor Molecule Glow",
        "category": "Healthcare",
        "preview_url": "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 700'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop stop-color='%232f6e6d'/><stop offset='1' stop-color='%23f2b67f'/></linearGradient></defs><rect width='1200' height='700' fill='url(%23g)'/></svg>",
        "source_url": "user-reference-1",
        "is_active": True,
    },
    {
        "layout_key": "doctor-molecule-crystal",
        "name": "Doctor Molecule Crystal",
        "category": "Healthcare",
        "preview_url": "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 700'><defs><linearGradient id='g2' x1='0' y1='0' x2='1' y2='1'><stop stop-color='%23b8b8be'/><stop offset='1' stop-color='%23a8d2da'/></linearGradient></defs><rect width='1200' height='700' fill='url(%23g2)'/></svg>",
        "source_url": "user-reference-2",
        "is_active": True,
    },
]


async def main() -> None:
    uri = os.getenv("MONGO_URI", "").strip()
    db_name = os.getenv("MONGO_DATABASE_NAME", "EventThon_Network").strip() or "EventThon_Network"
    if not uri:
        raise RuntimeError("MONGO_URI missing in backend/.env")
    client = AsyncIOMotorClient(uri, serverSelectionTimeoutMS=10_000)
    collection = client[db_name].get_collection("visithon_themes")
    now = datetime.utcnow()
    for theme in THEMES:
        await collection.update_one(
            {"layout_key": theme["layout_key"]},
            {"$set": {**theme, "updated_at": now}, "$setOnInsert": {"created_at": now}},
            upsert=True,
        )
    client.close()
    print("Upserted 2 reference themes in visithon_themes.")


if __name__ == "__main__":
    asyncio.run(main())
