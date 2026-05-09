from fastapi import APIRouter, HTTPException, Form, UploadFile, Request
from database import visithon_collection
from bson import ObjectId
import os
import json
import time

router = APIRouter()

@router.post("/update-multi-bank/{user_id}")
async def update_multi_bank_details(
    user_id: str, 
    request: Request,
    accounts_json: str = Form(...)
):
    try:
        # 1. JSON Parse karein
        try:
            accounts_list = json.loads(accounts_json)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid JSON format in accounts_json")

        # 2. Directory setup
        # Ensure karein ke folder backend root mein 'uploads/card_bank_qrs' ho
        upload_dir = os.path.join("uploads", "card_bank_qrs")
        os.makedirs(upload_dir, exist_ok=True)

        # 3. Form data nikalen
        form_data = await request.form()
        final_accounts = []

        for index, acc in enumerate(accounts_list):
            file_key = f"qr_file_{index}"
            qr_file = form_data.get(file_key)

            # Purani image ka naam fallback ke taur par
            current_qr_name = acc.get("pay_qr_img", "")

            # Agar nayi file upload ki gayi hy aur wo valid hy
            if qr_file and hasattr(qr_file, "filename") and qr_file.filename != "":
                file_ext = qr_file.filename.split(".")[-1]
                
                # Unique filename banayen
                timestamp = int(time.time())
                filename = f"bank_{user_id}_{index}_{timestamp}.{file_ext}"
                file_path = os.path.join(upload_dir, filename)
                
                # File save karein
                content = await qr_file.read()
                with open(file_path, "wb") as buffer:
                    buffer.write(content)
                
                current_qr_name = filename

            # Account object finalize (Sahi keys ke sath)
            final_accounts.append({
                "bank_name": acc.get("bank_name", ""),
                "account_title": acc.get("account_title", ""),
                "iban": acc.get("iban", ""),
                "pay_qr_img": current_qr_name
            })

        # 4. MongoDB Update
        if not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=400, detail="Invalid User ID format")

        result = await visithon_collection.update_one(
            {"_id": ObjectId(user_id)}, 
            {"$set": {"payment_methods": final_accounts}}
        )

        # Agar record match ho jaye (bhale hi data change na hua ho)
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User profile not found")

        return {
            "status": "success", 
            "message": f"Successfully updated {len(final_accounts)} payment methods",
            "data": final_accounts
        }
        
    except Exception as e:
        # Terminal mein check karein exact error kya hy
        print(f"❌ Backend Critical Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Server Error: {str(e)}")