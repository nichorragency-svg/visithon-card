from fastapi import APIRouter, HTTPException
import qrcode
from io import BytesIO
import base64

router = APIRouter()

@router.get("/generate-qr/{user_id}")
async def generate_qr(user_id: str):
    try:
        # Aapka profile URL jo scan karne par khulega
        # Note: Live hone par localhost ki jagah apni domain likhni hogi
        profile_url = f"http://localhost:3000/card/view/{user_id}"

        # QR Code settings
        # High error correction so a center logo/avatar overlay still scans reliably.
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=12,
            border=3,
        )
        qr.add_data(profile_url)
        qr.make(fit=True)

        # Image banana
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Image ko memory mein save karke base64 string mein badalna
        buffered = BytesIO()
        img.save(buffered, format="PNG")
        img_base64 = base64.b64encode(buffered.getvalue()).decode()

        return {
            "status": "success",
            "qr_image": f"data:image/png;base64,{img_base64}",
            "url": profile_url
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))