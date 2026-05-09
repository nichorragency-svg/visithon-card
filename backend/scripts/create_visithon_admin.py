"""One-off: insert an admin document into MongoDB collection `admins`.

Usage (from backend folder):
  python scripts/create_visithon_admin.py you@domain.com YourPassword123 "Display Name"

Requires MONGO_URI in backend/.env (same as main app).
"""
from __future__ import annotations

import asyncio
import os
import sys
from datetime import datetime
from pathlib import Path

import bcrypt
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

ROOT = Path(__file__).resolve().parents[1]
load_dotenv(ROOT / ".env")


def hash_pw(pw: str) -> str:
    return bcrypt.hashpw(pw.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


async def main() -> None:
    if len(sys.argv) < 3:
        print("Usage: python scripts/create_visithon_admin.py <email> <password> [display_name]")
        sys.exit(1)
    email = sys.argv[1].lower().strip()
    password = sys.argv[2]
    name = sys.argv[3] if len(sys.argv) > 3 else email.split("@")[0]
    uri = os.getenv("MONGO_URI", "").strip()
    db_name = os.getenv("MONGO_DATABASE_NAME", "EventThon_Network").strip() or "EventThon_Network"
    if not uri:
        print("MONGO_URI missing in backend/.env")
        sys.exit(1)
    client = AsyncIOMotorClient(uri, serverSelectionTimeoutMS=10_000)
    db = client[db_name]
    admins = db.get_collection("admins")
    existing = await admins.find_one({"email": email})
    if existing:
        print(f"Admin already exists: {email}")
        sys.exit(0)
    await admins.insert_one(
        {"email": email, "password": hash_pw(password), "name": name, "created_at": datetime.utcnow()}
    )
    print(f"Created admin: {email}")
    client.close()


if __name__ == "__main__":
    asyncio.run(main())
