from fastapi import APIRouter, Body, Depends, HTTPException
from bson import ObjectId
from pymongo.errors import PyMongoError
from database import visithon_collection
# Note: _user_id_from_token ko hum common utility se import karen gy
from ..wizard_utils import _user_id_from_token

router = APIRouter()

_ALLOWED_PRICING_PLANS = frozenset({"free", "basic", "pro"})

# 1. Main Profession Save (Step 1 Initial)
@router.patch("/step1")
async def save_step1(
    data: dict = Body(...),
    uid: str = Depends(_user_id_from_token),
):
    profession = (data.get("profession") or "").strip()
    if not profession:
        raise HTTPException(status_code=400, detail="profession is required")
    try:
        await visithon_collection.update_one(
            {"_id": ObjectId(uid)},
            {
                "$set": {
                    "profile.step1.profession": profession,
                    "profile_format_version": 2,
                }
            },
        )
    except (PyMongoError, ValueError):
        raise HTTPException(status_code=503, detail="Database error")
    return {"ok": True}

# 2. Shop/Portfolio Flag (Future Planning)
@router.patch("/step1/shop-flag")
async def save_step1_shop_flag(
    data: dict = Body(...),
    uid: str = Depends(_user_id_from_token),
):
    raw = data.get("shop_portfolio_enabled")
    if raw is not True and raw is not False:
        raise HTTPException(status_code=400, detail="shop_portfolio_enabled must be true or false")
    try:
        sets: dict = {
            "profile.step1.shop_portfolio_enabled": bool(raw),
            "profile_format_version": 2,
        }
        if raw is False:
            sets["profile.step1.pricing_plan"] = ""
        await visithon_collection.update_one({"_id": ObjectId(uid)}, {"$set": sets})
    except (PyMongoError, ValueError):
        raise HTTPException(status_code=503, detail="Database error")
    return {"ok": True, "shop_portfolio_enabled": bool(raw)}

# 3. Pricing Plan
@router.patch("/step1/pricing-plan")
async def save_step1_pricing_plan(
    data: dict = Body(...),
    uid: str = Depends(_user_id_from_token),
):
    plan = str(data.get("pricing_plan") or "").strip().lower()
    if plan not in _ALLOWED_PRICING_PLANS:
        raise HTTPException(status_code=400, detail="pricing_plan must be one of: free, basic, pro")
    
    try:
        doc = await visithon_collection.find_one({"_id": ObjectId(uid)})
        if not doc:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if shop is enabled before setting plan
        p = doc.get("profile") or {}
        s1 = p.get("step1") or {}
        if s1.get("shop_portfolio_enabled") is not True:
            raise HTTPException(
                status_code=400,
                detail="Pricing plan applies only when shop_portfolio_enabled is true",
            )

        await visithon_collection.update_one(
            {"_id": ObjectId(uid)},
            {"$set": {"profile.step1.pricing_plan": plan, "profile_format_version": 2}},
        )
    except (PyMongoError, ValueError):
        raise HTTPException(status_code=503, detail="Database error")
    return {"ok": True, "pricing_plan": plan}