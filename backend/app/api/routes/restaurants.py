from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.schemas.restaurant import (
    RestaurantQueryParams,
    RestaurantResponse,
    RestaurantUpdateRequest,
)
from app.services import restaurant_service

router = APIRouter(prefix="/api/restaurants", tags=["restaurants"])


@router.get("", response_model=list[RestaurantResponse])
async def get_restaurants(
    params: RestaurantQueryParams = Depends(),
    session: AsyncSession = Depends(get_db_session),
) -> list[dict]:
    return await restaurant_service.list_restaurants(session, params)


@router.get("/random", response_model=RestaurantResponse)
async def get_random_restaurant(
    params: RestaurantQueryParams = Depends(),
    session: AsyncSession = Depends(get_db_session),
) -> dict:
    return await restaurant_service.random_restaurant(session, params)


@router.get("/{restaurant_id}", response_model=RestaurantResponse)
async def get_restaurant(restaurant_id: str, session: AsyncSession = Depends(get_db_session)) -> dict:
    return await restaurant_service.get_restaurant(session, restaurant_id)


@router.put("/{restaurant_id}", response_model=RestaurantResponse)
async def update_restaurant(
    restaurant_id: str,
    payload: RestaurantUpdateRequest,
    session: AsyncSession = Depends(get_db_session),
) -> dict:
    return await restaurant_service.update_restaurant(session, restaurant_id, payload)


@router.delete("/{restaurant_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_restaurant(
    restaurant_id: str,
    session: AsyncSession = Depends(get_db_session),
) -> Response:
    await restaurant_service.delete_restaurant(session, restaurant_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
