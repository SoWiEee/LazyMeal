from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories import restaurant_repository
from app.schemas.restaurant import RestaurantQueryParams, RestaurantUpdateRequest


async def list_restaurants(session: AsyncSession, params: RestaurantQueryParams) -> list[dict]:
    _validate_geo_params(params)
    rows = await restaurant_repository.list_restaurants(session, params)
    return [dict(row) for row in rows]


async def random_restaurant(session: AsyncSession, params: RestaurantQueryParams) -> dict:
    _validate_geo_params(params)
    row = await restaurant_repository.get_random_restaurant(session, params)
    if not row:
        raise HTTPException(status_code=404, detail="No restaurants found matching criteria.")
    return dict(row)


async def get_restaurant(session: AsyncSession, restaurant_id: str) -> dict:
    row = await restaurant_repository.get_restaurant_by_id(session, restaurant_id)
    if not row:
        raise HTTPException(status_code=404, detail="Restaurant not found.")
    return dict(row)


async def update_restaurant(
    session: AsyncSession, restaurant_id: str, payload: RestaurantUpdateRequest
) -> dict:
    row = await restaurant_repository.update_restaurant(session, restaurant_id, payload)
    if not row:
        raise HTTPException(status_code=404, detail="Restaurant not found.")
    return dict(row)


async def delete_restaurant(session: AsyncSession, restaurant_id: str) -> None:
    deleted = await restaurant_repository.delete_restaurant(session, restaurant_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Restaurant not found.")


def _validate_geo_params(params: RestaurantQueryParams) -> None:
    has_partial_geo = (params.lat is None) ^ (params.lon is None)
    if has_partial_geo:
        raise HTTPException(status_code=400, detail="lat and lon must be provided together.")

    if params.radius_km is not None and params.radius_km <= 0:
        raise HTTPException(status_code=400, detail="radiusKm must be greater than 0.")
