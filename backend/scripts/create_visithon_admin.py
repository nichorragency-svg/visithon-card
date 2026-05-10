"""One-off: insert or reset admin in MongoDB collection `admins`.

Create (from backend folder):
  python scripts/create_visithon_admin.py you@domain.com YourPassword123 "Display Name"

Reset password for existing admin:
  python scripts/create_visithon_admin.py --reset you@domain.com NewPassword123

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
    argv = sys.argv[1:]
    reset = False
    if argv and argv[0] == "--reset":
        reset = True
        argv = argv[1:]

    if len(argv) < 2:
        print(
            "Usage:\n"
            "  python scripts/create_visithon_admin.py <email> <password> [display_name]\n"
            "  python scripts/create_visithon_admin.py --reset <email> <new_password>",
        )
        sys.exit(1)

    email = argv[0].lower().strip()
    password = argv[1]
    name = argv[2] if len(argv) > 2 else email.split("@")[0]

    uri = os.getenv("MONGO_URI", "").strip()
    db_name = os.getenv("MONGO_DATABASE_NAME", "EventThon_Network").strip() or "EventThon_Network"
    if not uri:
        print("MONGO_URI missing in backend/.env")
        sys.exit(1)

    client = AsyncIOMotorClient(uri, serverSelectionTimeoutMS=10_000)
    db = client[db_name]
    admins = db.get_collection("admins")
    existing = await admins.find_one({"email": email})

    if reset:
        if not existing:
            print(f"No admin with email: {email}. Create first without --reset.")
            sys.exit(1)
        await admins.update_one({"email": email}, {"$set": {"password": hash_pw(password)}})
        print(f"Password updated for admin: {email}")
        client.close()
        return

    if existing:
        print(f"Admin already exists: {email}. Use --reset to change password.")
        sys.exit(1)

    await admins.insert_one(
        {"email": email, "password": hash_pw(password), "name": name, "created_at": datetime.utcnow()}
    )
    print(f"Created admin: {email}")
    client.close()


if __name__ == "__main__":
    asyncio.run(main())
