from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import os

# Naye folder structure ke mutabiq imports
from database import user_collection, visithon_collection
from admin_panel.router import router as admin_router
from admin_panel.payment_routes import admin_payment_router, public_payment_router
from digital_card import (
    card_auth,
    card_management,
    card_view,
    vcard_handler,
    qr_handler,
    bank_handler,
    product_handler,
    wizard,
    reminders,
)

app = FastAPI(title="Visithon Card API")


def _cors_settings() -> tuple[list[str], bool]:
    """
    Browser fetches (admin API, vCard photo fetch from /static/, Supabase) need ACAO headers
    when the page origin differs from the API (e.g. frontend :80 / Vercel → API :8000).

    Wildcard origin must not be combined with allow_credentials=True (browser spec).
    Set CORS_ALLOWED_ORIGINS for production, comma-separated, e.g.:
      https://visithon.com,https://www.visithon.com,http://localhost:3000
    """
    raw = os.getenv("CORS_ALLOWED_ORIGINS", "").strip()
    if not raw:
        return (["*"], False)
    origins = [o.strip() for o in raw.split(",") if o.strip()]
    if not origins:
        return (["*"], False)
    creds = os.getenv("CORS_ALLOW_CREDENTIALS", "true").strip().lower() in ("1", "true", "yes")
    return (origins, creds)


_cors_origins, _cors_credentials = _cors_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=_cors_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files (Images/Uploads ke liye) — CORS middleware above applies to these responses too
if not os.path.exists("uploads"):
    os.makedirs("uploads")
app.mount("/static", StaticFiles(directory="uploads"), name="static")

# --- Syncing Endpoint ---
@app.get("/get-user-by-email/{email}")
async def get_user_by_email(email: str):
    user = await visithon_collection.find_one({"email": email})
    if user:
        user["_id"] = str(user["_id"])
        return user
    raise HTTPException(status_code=404, detail="User not found")

# --- DIGITAL CARD ROUTES REGISTRATION ---
# In ke prefixes wahi rakhay hain jo aapke React frontend mein use ho rahay hain
app.include_router(card_auth.router, prefix="/card-auth", tags=["Auth"])
app.include_router(card_management.router, prefix="/card-editor", tags=["Editor"])
app.include_router(card_view.router, tags=["Public View"])

# Handlers
app.include_router(vcard_handler.router, prefix="/card-auth", tags=["vCard"])
app.include_router(qr_handler.router, prefix="/card-auth", tags=["QR"])
app.include_router(bank_handler.router, prefix="/card-auth", tags=["Bank"])
app.include_router(product_handler.router, prefix="/card-auth", tags=["Products"])
app.include_router(wizard.router, prefix="/visithon/wizard", tags=["Visithon Wizard"])
app.include_router(reminders.router, prefix="/visithon/reminders", tags=["Visithon Reminders"])
app.include_router(admin_router, prefix="/admin", tags=["Visithon Admin"])
app.include_router(admin_payment_router, prefix="/admin", tags=["Admin manual payments"])
app.include_router(public_payment_router, tags=["Public payments"])

@app.get("/")
async def root():
    return {"message": "Visithon Card API is running"}
