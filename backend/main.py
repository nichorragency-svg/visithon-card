from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import os

# Naye folder structure ke mutabiq imports
from database import user_collection, visithon_collection
from admin_panel.router import router as admin_router
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

# Static files (Images/Uploads ke liye)
if not os.path.exists("uploads"):
    os.makedirs("uploads")
app.mount("/static", StaticFiles(directory="uploads"), name="static")

# CORS Setup - Isay "*" kar dete hain taake development mein masla na aaye
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.get("/")
async def root():
    return {"message": "Visithon Card API is running"}