from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, Body
from database import visithon_collection
from bson import ObjectId
import shutil
import os
import json
from datetime import datetime

import qrcode
from io import BytesIO
import base64


router = APIRouter()

# Uploads directory setup
UPLOAD_DIR = "uploads/digital_cards"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

# Helper function to save images
async def save_image(file: UploadFile, folder: str):
    filename = f"{folder}_{datetime.now().timestamp()}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    # Database mein save karne ke liye sirf filename return karen
    return filename

# --- CARD PUBLISH / UPDATE API ---
@router.post("/publish")
async def publish_card(
    user_id: str = Form(...),
    name: str = Form(...),
    role: str = Form(...),
    company: str = Form(...),
    phone1: str = Form(...),
    phone2: str = Form(None),
    whatsapp: str = Form(None),
    email: str = Form(None),
    website: str = Form(None),
    locationUrl: str = Form(None),
    social_links: str = Form(...), # JSON stringified data
    profileImg: UploadFile = File(None),
    coverImg: UploadFile = File(None),
    productBtnImage: UploadFile = File(None)
):
    try:
        # Parse social links
        social_data = json.loads(social_links)
        
        # Image URLs ki list taiyar karein
        update_data = {
            "name": name,
            "role": role,
            "company": company,
            "phone1": phone1,
            "phone2": phone2,
            "whatsapp": whatsapp,
            "email": email,
            "website": website,
            "locationUrl": locationUrl,
            "social_links": social_data,
            "updated_at": datetime.utcnow()
        }

        # Agar images upload hui hain to save karein aur path update karein
        if profileImg:
            path = await save_image(profileImg, "profile")
            update_data["profileImg"] = path
        
        if coverImg:
            path = await save_image(coverImg, "cover")
            update_data["coverImg"] = path

        if productBtnImage:
            path = await save_image(productBtnImage, "product")
            update_data["productBtnImage"] = path

        # Database mein update karein
        result = await visithon_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"card_details": update_data}}
        )

        if result.modified_count == 0:
             # Agar user pehli dafa publish kar raha hy
             await visithon_collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"card_details": update_data}},
                upsert=True
            )

        return {"status": "success", "message": "Card Published Successfully!", "data": update_data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server Error: {str(e)}")

# --- GET CARD DATA API ---
@router.get("/get-card/{user_id}")
async def get_card_data(user_id: str):
    card = await visithon_collection.find_one({"_id": ObjectId(user_id)})
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    # MongoDB object ko readable banana
    card["_id"] = str(card["_id"])
    return card


@router.get("/get-qr/{user_id}")
async def get_user_qr(user_id: str):
    # Profile ka mukammal URL (Apni live site ya local ip ke mutabiq change karein)
    profile_url = f"http://localhost:3000/card/view/{user_id}"
    
    # QR Code Generate karna
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(profile_url)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Image ko memory mein save karke base64 format mein convert karna
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    
    return {"status": "success", "qr_code": f"data:image/png;base64,{img_str}"}