"""Admin: platform bank/QR config + manual payment requests; public: submit proof."""
from __future__ import annotations

import os
import re
import shutil
from datetime import datetime

from bson import ObjectId
from fastapi import APIRouter, Body, Depends, File, Form, HTTPException, UploadFile
from pymongo.errors import PyMongoError

from admin_panel.auth_deps import admin_from_token
from database import manual_payment_requests_collection, platform_payment_settings_collection

admin_payment_router = APIRouter()
public_payment_router = APIRouter()

_UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads", "payment_assets")
_ALLOWED_EXT = frozenset({"png", "jpg", "jpeg", "webp", "gif"})
_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _ensure_upload_dir() -> None:
    os.makedirs(_UPLOAD_DIR, exist_ok=True)


async def _save_upload(upload: UploadFile, prefix: str) -> str:
    _ensure_upload_dir()
    raw_name = (upload.filename or "file").rsplit(".", 1)
    ext = raw_name[-1].lower() if len(raw_name) > 1 else "bin"
    if ext not in _ALLOWED_EXT:
        ext = "png"
    fname = f"{prefix}_{int(datetime.utcnow().timestamp() * 1000)}.{ext}"
    dest = os.path.join(_UPLOAD_DIR, fname)
    with open(dest, "wb") as out:
        shutil.copyfileobj(upload.file, out)
    return f"payment_assets/{fname}"


def _doc_out(doc: dict) -> dict:
    if not doc:
        return {}
    out = {k: v for k, v in doc.items() if k != "_id"}
    out["id"] = str(doc["_id"])
    return out


@admin_payment_router.get("/platform-payment-settings")
async def get_platform_settings(_: dict = Depends(admin_from_token)):
    try:
        doc = await platform_payment_settings_collection.find_one({"scope": "platform"})
    except PyMongoError as exc:
        raise HTTPException(status_code=503, detail="Database error") from exc
    if not doc:
        return {
            "bank_name": "",
            "account_title": "",
            "account_number": "",
            "iban": "",
            "wallet_label": "",
            "wallet_number": "",
            "qr_static_path": "",
            "instructions": "",
        }
    return _doc_out(doc)


@admin_payment_router.put("/platform-payment-settings")
async def put_platform_settings(data: dict = Body(...), _: dict = Depends(admin_from_token)):
    keys = (
        "bank_name",
        "account_title",
        "account_number",
        "iban",
        "wallet_label",
        "wallet_number",
        "qr_static_path",
        "instructions",
    )
    payload = {k: str(data.get(k) or "").strip() for k in keys}
    payload["scope"] = "platform"
    payload["updated_at"] = datetime.utcnow()
    try:
        await platform_payment_settings_collection.update_one(
            {"scope": "platform"},
            {"$set": payload},
            upsert=True,
        )
    except PyMongoError as exc:
        raise HTTPException(status_code=503, detail="Database error") from exc
    return {"ok": True}


@admin_payment_router.post("/platform-payment-settings/qr")
async def upload_platform_qr(file: UploadFile = File(...), _: dict = Depends(admin_from_token)):
    if not file.content_type or not str(file.content_type).startswith("image/"):
        raise HTTPException(status_code=400, detail="Image file required")
    rel = await _save_upload(file, "platform_qr")
    try:
        await platform_payment_settings_collection.update_one(
            {"scope": "platform"},
            {"$set": {"qr_static_path": rel, "updated_at": datetime.utcnow()}},
            upsert=True,
        )
    except PyMongoError as exc:
        raise HTTPException(status_code=503, detail="Database error") from exc
    return {"qr_static_path": rel}


@admin_payment_router.get("/manual-payment-requests")
async def list_manual_requests(
    status: str | None = None,
    _: dict = Depends(admin_from_token),
):
    q: dict = {}
    if status in ("pending", "approved", "rejected"):
        q["status"] = status
    try:
        cur = manual_payment_requests_collection.find(q).sort("created_at", -1).limit(200)
        docs = await cur.to_list(200)
    except PyMongoError as exc:
        raise HTTPException(status_code=503, detail="Database error") from exc
    return {"items": [_doc_out(d) for d in docs]}


@admin_payment_router.patch("/manual-payment-requests/{request_id}")
async def resolve_manual_request(
    request_id: str,
    data: dict = Body(...),
    _: dict = Depends(admin_from_token),
):
    st = str(data.get("status") or "").strip().lower()
    if st not in ("approved", "rejected"):
        raise HTTPException(status_code=400, detail="status must be approved or rejected")
    try:
        oid = ObjectId(request_id)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid request id") from exc
    note = str(data.get("admin_note") or "").strip()[:500]
    try:
        res = await manual_payment_requests_collection.update_one(
            {"_id": oid},
            {"$set": {"status": st, "admin_note": note, "resolved_at": datetime.utcnow()}},
        )
    except PyMongoError as exc:
        raise HTTPException(status_code=503, detail="Database error") from exc
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Request not found")
    return {"ok": True}


@public_payment_router.post("/public/manual-payment-requests")
async def submit_manual_payment(
    payer_email: str = Form(...),
    payer_name: str = Form(""),
    amount: str = Form(...),
    currency: str = Form("PKR"),
    plan_label: str = Form(""),
    note: str = Form(""),
    proof: UploadFile = File(...),
):
    email = payer_email.strip().lower()
    if not _EMAIL_RE.match(email):
        raise HTTPException(status_code=400, detail="Valid payer_email required")
    amt = str(amount).strip()
    if not amt or len(amt) > 32:
        raise HTTPException(status_code=400, detail="Valid amount required")
    if not proof.content_type or not str(proof.content_type).startswith("image/"):
        raise HTTPException(status_code=400, detail="Proof image required")
    rel = await _save_upload(proof, "proof")
    doc = {
        "payer_email": email,
        "payer_name": str(payer_name or "").strip()[:120],
        "amount": amt,
        "currency": str(currency or "PKR").strip()[:8] or "PKR",
        "plan_label": str(plan_label or "").strip()[:120],
        "note": str(note or "").strip()[:500],
        "proof_static_path": rel,
        "status": "pending",
        "created_at": datetime.utcnow(),
    }
    try:
        ins = await manual_payment_requests_collection.insert_one(doc)
    except PyMongoError as exc:
        raise HTTPException(status_code=503, detail="Database error") from exc
    return {"ok": True, "id": str(ins.inserted_id)}


@public_payment_router.get("/public/platform-payment-settings")
async def public_platform_settings():
    """Bank details for payers (no secrets beyond what you store)."""
    try:
        doc = await platform_payment_settings_collection.find_one({"scope": "platform"})
    except PyMongoError as exc:
        raise HTTPException(status_code=503, detail="Database error") from exc
    if not doc:
        return {
            "bank_name": "",
            "account_title": "",
            "account_number": "",
            "iban": "",
            "wallet_label": "",
            "wallet_number": "",
            "qr_static_path": "",
            "instructions": "",
        }
    out = _doc_out(doc)
    out.pop("admin_note", None)
    return out
