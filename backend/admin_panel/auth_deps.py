"""Shared admin JWT verification for admin_panel routes."""
from __future__ import annotations

import os

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

ADMIN_SECRET = os.getenv("ADMIN_JWT_SECRET", "VISITHON_ADMIN_CHANGE_ME_IN_PRODUCTION")
ADMIN_ALGORITHM = "HS256"
_bearer = HTTPBearer(auto_error=False)


async def admin_from_token(creds: HTTPAuthorizationCredentials | None = Depends(_bearer)) -> dict:
    if not creds or not creds.credentials:
        raise HTTPException(status_code=401, detail="Admin Bearer token required")
    try:
        payload = jwt.decode(creds.credentials, ADMIN_SECRET, algorithms=[ADMIN_ALGORITHM])
    except JWTError as exc:
        raise HTTPException(status_code=401, detail="Invalid or expired admin token") from exc
    if payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not an admin token")
    return payload
