"""Create Supabase Auth users with confirmed email (admin-only; service role on server)."""
from __future__ import annotations

import os
from typing import Any

import httpx
from fastapi import HTTPException


async def supabase_admin_create_confirmed_user(*, email: str, password: str, full_name: str) -> dict[str, Any]:
    base = os.getenv("SUPABASE_URL", "").strip().rstrip("/")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()
    if not base or not key:
        raise HTTPException(
            status_code=503,
            detail="Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY on the API server for admin user creation.",
        )
    url = f"{base}/auth/v1/admin/users"
    payload = {
        "email": email.lower().strip(),
        "password": password,
        "email_confirm": True,
        "user_metadata": {"full_name": full_name.strip()},
    }
    async with httpx.AsyncClient(timeout=30.0) as client:
        r = await client.post(
            url,
            json=payload,
            headers={
                "Authorization": f"Bearer {key}",
                "apikey": key,
                "Content-Type": "application/json",
            },
        )
    if r.status_code in (200, 201):
        try:
            return r.json()
        except Exception:
            return {}

    try:
        err_body = r.json()
    except Exception:
        err_body = {"message": (r.text or "")[:500]}
    msg = err_body.get("msg") or err_body.get("error_description") or err_body.get("message") or str(err_body)
    low = str(msg).lower()
    if "already" in low or "registered" in low or "exists" in low:
        raise HTTPException(status_code=400, detail="This email is already registered.")
    raise HTTPException(status_code=400, detail=f"Supabase: {msg}")
