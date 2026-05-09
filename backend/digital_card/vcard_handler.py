from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from database import visithon_collection
from bson import ObjectId
import vobject

from digital_card.card_view import _public_card_payload

router = APIRouter()

@router.get("/download-vcard/{user_id}")
async def download_vcard(user_id: str):
    try:
        user = await visithon_collection.find_one({"_id": ObjectId(user_id)})

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        uid_str = str(user["_id"])
        d = _public_card_payload(user, uid_str)

        vcard = vobject.vCard()

        vcard.add('fn').value = d.get("name") or "Unknown User"
        vcard.add('n').value = vobject.vcard.Name(family='', given=d.get("name") or "")

        if d.get("phone1"):
            tel = vcard.add('tel')
            tel.value = d.get("phone1")
            tel.type_param = 'WORK'

        if d.get("email"):
            em = vcard.add('email')
            em.value = d.get("email")
            em.type_param = 'INTERNET'

        if d.get("company"):
            vcard.add('org').value = [d.get("company")]

        if d.get("role"):
            vcard.add('title').value = d.get("role")

        if d.get("website"):
            vcard.add('url').value = d.get("website")

        vcard_output = vcard.serialize()

        filename = f"{d.get('name', 'contact')}.vcf".replace(" ", "_")
        
        return Response(
            content=vcard_output,
            media_type="text/vcard",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )

    except Exception as e:
        print(f"vCard Error: {e}")
        raise HTTPException(status_code=500, detail="Error generating vCard")