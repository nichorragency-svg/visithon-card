from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from database import visithon_collection
from .wizard_utils import _user_id_from_token
from .wizard_steps import (
    step1, step2, step3, step4, step5, 
    step6, step7, step8, step9
)

router = APIRouter()

# --- STEP ROUTERS INCLUDE ---
# Humne har step ko uske prefix ke sath attach kar diya hy
router.include_router(step1.router, prefix="/wizard", tags=["Step 1"])
router.include_router(step2.router, prefix="/wizard", tags=["Step 2"])
router.include_router(step3.router, prefix="/wizard", tags=["Step 3"])
router.include_router(step4.router, prefix="/wizard", tags=["Step 4"])
router.include_router(step5.router, prefix="/wizard", tags=["Step 5"])
router.include_router(step6.router, prefix="/wizard", tags=["Step 6"])
router.include_router(step7.router, prefix="/wizard", tags=["Step 7"])
router.include_router(step8.router, prefix="/wizard", tags=["Step 8"])
# Step 9 ka route frontend k mutabiq card-auth ya wizard k sath adjust ho skta hy
router.include_router(step9.router, prefix="/card-auth", tags=["Step 9"])

# --- SHARED WIZARD ENDPOINTS ---

@router.get("/wizard/state")
async def get_wizard_full_state(uid: str = Depends(_user_id_from_token)):
    try:
        user_data = await visithon_collection.find_one(
            {"_id": ObjectId(uid)},
            # Yeh teeno fields lazmi mangwani hain
            {"profile": 1, "wizard_completed": 1, "is_published": 1}
        )
        
        if not user_data:
            return {"ok": False, "profile": {}, "wizard_completed": False}
            
        return {
            "ok": True,
            "profile": user_data.get("profile", {}),
            # Agar DB mein field na ho toh default False bhejain
            "wizard_completed": user_data.get("wizard_completed", False),
            "is_published": user_data.get("is_published", False)
        }
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.get("/wizard/reset")
async def reset_wizard_progress(uid: str = Depends(_user_id_from_token)):
    """Agar user dobara shuru se wizard bharna chahay."""
    try:
        await visithon_collection.update_one(
            {"_id": ObjectId(uid)},
            {"$set": {"profile": {}, "wizard_completed": False}}
        )
        return {"ok": True, "message": "Wizard progress has been reset"}
    except Exception:
        raise HTTPException(status_code=500, detail="Could not reset progress")