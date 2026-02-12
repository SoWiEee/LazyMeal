from uuid import uuid4

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.repositories.user_repository import create_user, get_user_by_id, get_user_by_username


async def register(session: AsyncSession, username: str, password: str) -> dict:
    existing = await get_user_by_username(session, username)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already exists.")

    user = await create_user(
        session,
        user_id=str(uuid4()),
        username=username,
        password_hash=hash_password(password),
        role="user",
    )
    return _build_token_pair(dict(user))


async def login(session: AsyncSession, username: str, password: str) -> dict:
    user = await get_user_by_username(session, username)
    if not user or not verify_password(password, user["passwordHash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials.")
    return _build_token_pair(dict(user))


async def refresh(session: AsyncSession, refresh_token: str) -> dict:
    try:
        payload = decode_token(refresh_token)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token.") from exc

    if payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type.")

    user_id = payload.get("sub")
    user = await get_user_by_id(session, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found.")

    return _build_token_pair(dict(user))


def _build_token_pair(user: dict) -> dict:
    access_token = create_access_token(user["id"], user["role"])
    refresh_token = create_refresh_token(user["id"], user["role"])
    return {
        "accessToken": access_token,
        "refreshToken": refresh_token,
        "tokenType": "bearer",
    }

