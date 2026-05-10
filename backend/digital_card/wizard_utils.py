"""JWT → Mongo user id for Visithon wizard / legacy card-auth routes."""
from __future__ import annotations

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from .card_auth import ALGORITHM, SECRET_KEY

_bearer = HTTPBearer(auto_error=False)


async def _user_id_from_token(
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> str:
    if not creds or not creds.credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(creds.credentials, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError as exc:
        raise HTTPException(status_code=401, detail="Invalid or expired token") from exc
    uid = payload.get("id")
    if uid is None or str(uid).strip() == "":
        raise HTTPException(status_code=401, detail="Invalid token payload")
    return str(uid)
