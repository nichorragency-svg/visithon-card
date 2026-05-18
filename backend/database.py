import os
from pathlib import Path

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv(Path(__file__).resolve().parent / ".env")

MONGO_DETAILS = (os.getenv("MONGO_URI") or os.getenv("MONGODB_URL") or "").strip()
if not MONGO_DETAILS:
    raise RuntimeError(
        "MONGO_URI missing. Copy backend/.env.example to backend/.env and set MONGO_URI."
    )

_db_name = os.getenv("MONGO_DATABASE_NAME", "EventThon_Network").strip() or "EventThon_Network"
# Fail fast: server pick + TCP connect. socketTimeoutMS stops hung reads (otherwise
# /card-view etc. can wait forever when Atlas stalls after connect).
client = AsyncIOMotorClient(
    MONGO_DETAILS,
    serverSelectionTimeoutMS=10_000,
    connectTimeoutMS=10_000,
    socketTimeoutMS=20_000,
    waitQueueTimeoutMS=5000,
)
database = client[_db_name]

# Visithon Card — MongoDB collection: visithon_cards
visithon_collection = database.get_collection("visithon_cards")

# Visithon Admin Panel — separate from card users (collection: admins)
admins_collection = database.get_collection("admins")

# Admin theme management (collection: visithon_themes)
themes_collection = database.get_collection("visithon_themes")

# Main app users (legacy / shared)
user_collection = database.get_collection("users")

# Platform manual payment (admin bank + user proof submissions)
platform_payment_settings_collection = database.get_collection("visithon_platform_payment_settings")
manual_payment_requests_collection = database.get_collection("visithon_manual_payment_requests")

# Saved Visithon cards directory (per logged-in card user)
visithon_saved_contacts_collection = database.get_collection("visithon_saved_contacts")
