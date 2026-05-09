from fastapi import APIRouter, HTTPException, Form, UploadFile, Request
from database import visithon_collection
from bson import ObjectId
import os
import json
import time

router = APIRouter()

@router.post("/update-products/{user_id}")
async def update_card_products(
    user_id: str, 
    request: Request,
    products_json: str = Form(...)
):
    try:
        # 1. User ID check karein (Sabse pehla masla yehi hota hy)
        if not ObjectId.is_valid(user_id):
            print(f"❌ Invalid User ID: {user_id}")
            raise HTTPException(status_code=400, detail="Invalid User ID format")

        # 2. JSON Parse karein
        try:
            products_list = json.loads(products_json)
        except Exception as e:
            print(f"❌ JSON Error: {str(e)}")
            raise HTTPException(status_code=400, detail="Invalid products data format")

        # 3. Directory Setup
        upload_dir = os.path.join("uploads", "product_assets")
        os.makedirs(upload_dir, exist_ok=True)

        form_data = await request.form()
        final_products = []

        for index, prod in enumerate(products_list):
            file_key = f"prod_file_{index}"
            prod_file = form_data.get(file_key)
            
            # Purani image ka naam (agar image upload nahi ki to purani hi rahegi)
            current_img = prod.get("image", "")

            # Nayi image save karne ki logic
            # Hum check karte hain ke kya ye waqai aik UploadFile object hy
            if prod_file and hasattr(prod_file, "filename") and prod_file.filename != "":
                file_ext = prod_file.filename.split(".")[-1]
                timestamp = int(time.time())
                # Unique name takay caching ka masla na ho
                filename = f"prod_{user_id}_{index}_{timestamp}.{file_ext}"
                file_path = os.path.join(upload_dir, filename)
                
                content = await prod_file.read()
                with open(file_path, "wb") as buffer:
                    buffer.write(content)
                
                current_img = filename

            final_products.append({
                "name": prod.get("name", ""),
                "price": prod.get("price", ""),
                "image": current_img
            })

        # 4. MongoDB Update
        result = await visithon_collection.update_one(
            {"_id": ObjectId(user_id)}, 
            {"$set": {"products": final_products}}
        )

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")

        return {
            "status": "success", 
            "message": f"Successfully updated {len(final_products)} products",
            "data": final_products
        }
        
    except Exception as e:
        print(f"❌ Product Update Critical Error: {str(e)}")
        # Detail error bhejain takay frontend par pata chalay
        raise HTTPException(status_code=500, detail=f"Server Error: {str(e)}")