import json
from fastapi import APIRouter, Body, Depends, HTTPException, UploadFile, File, Form
from bson import ObjectId
from pymongo.errors import PyMongoError
from database import visithon_collection
from ..wizard_utils import _user_id_from_token

router = APIRouter()

@router.post("/update-multi-bank/{user_id}")
async def save_step9_payments(
    user_id: str,
    accounts_json: str = Form(...),
    uid: str = Depends(_user_id_from_token)
):
    # Debugging: Terminal mein check kren k ID sahi aa rhi hy ya nahi
    print(f"DEBUG: Frontend ID: {user_id}, Token UID: {uid}")

    # Convert both to string for reliable comparison
    if str(uid) != str(user_id):
        return {"ok": False, "message": "Unauthorized: ID Mismatch"}

    try:
        accounts_list = json.loads(accounts_json)
        if not isinstance(accounts_list, list):
            return {"ok": False, "message": "Invalid accounts format"}

        final_accounts = []
        for acc in accounts_list:
            final_accounts.append({
                "bank_name": (acc.get("bank_name") or "").strip(),
                "account_title": (acc.get("account_title") or "").strip(),
                "iban": (acc.get("iban") or "").strip(),
                "qr_image_url": acc.get("qr_image_url") or ""
            })

        # Database Update
        result = await visithon_collection.update_one(
            {"_id": ObjectId(uid)},
            {
                "$set": {
                    "profile.step9.accounts": final_accounts,
                    "wizard_completed": True,
                    "is_published": True,
                    "profile_format_version": 2
                }
            }
        )
        
        # Modified count 0 bhi ho skta hy agar data same ho, islye matched_count check kren
        if result.matched_count > 0:
            return {"ok": True, "message": "Payment accounts saved and card finalized"}
        
        return {"ok": False, "message": "User document not found in database"}

    except json.JSONDecodeError:
        return {"ok": False, "message": "Invalid JSON format"}
    except (PyMongoError, ValueError) as e:
        print(f"DB Error: {e}")
        return {"ok": False, "message": "Database update failed"}

@router.get("/state")
async def get_wizard_state(uid: str = Depends(_user_id_from_token)):
    try:
        doc = await visithon_collection.find_one({"_id": ObjectId(uid)})
        if not doc:
            return {"ok": False, "profile": {}, "wizard_completed": False}
            
        return {
            "ok": True, 
            "profile": doc.get("profile", {}),
            # Ye flags lazmi bhejein taake Step 1 redirect kr sakay
            "wizard_completed": doc.get("wizard_completed", False),
            "is_published": doc.get("is_published", False)
        }
    except Exception as e:
        print(f"State Error: {e}")
        raise HTTPException(status_code=500, detail="Error fetching state")