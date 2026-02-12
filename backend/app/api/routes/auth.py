from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user
from app.db.session import get_db_session
from app.schemas.auth import (
    AuthLoginRequest,
    AuthRegisterRequest,
    CurrentUserResponse,
    TokenPairResponse,
    TokenRefreshRequest,
)
from app.services import auth_service

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenPairResponse)
async def register(
    payload: AuthRegisterRequest,
    session: AsyncSession = Depends(get_db_session),
) -> dict:
    return await auth_service.register(session, payload.username, payload.password)


@router.post("/login", response_model=TokenPairResponse)
async def login(
    payload: AuthLoginRequest,
    session: AsyncSession = Depends(get_db_session),
) -> dict:
    return await auth_service.login(session, payload.username, payload.password)


@router.post("/refresh", response_model=TokenPairResponse)
async def refresh(
    payload: TokenRefreshRequest,
    session: AsyncSession = Depends(get_db_session),
) -> dict:
    return await auth_service.refresh(session, payload.refreshToken)


@router.get("/me", response_model=CurrentUserResponse)
async def get_me(user: dict = Depends(get_current_user)) -> dict:
    return {"id": user["id"], "username": user["username"], "role": user["role"]}

