import json

from fastapi import HTTPException
from redis.exceptions import RedisError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.cache import build_cache_key, get_redis_client, invalidate_namespace
from app.core.config import get_settings
from app.repositories import restaurant_repository
from app.schemas.restaurant import RestaurantQueryParams, RestaurantUpdateRequest

settings = get_settings()


async def list_restaurants(session: AsyncSession, params: RestaurantQueryParams) -> list[dict]:
    _validate_geo_params(params)
    cache_key = build_cache_key("restaurants:list", params.model_dump())
    redis = get_redis_client()

    if redis:
        try:
            cached = await redis.get(cache_key)
            if cached:
                return json.loads(cached)
        except (RedisError, json.JSONDecodeError):
            pass

    rows = await restaurant_repository.list_restaurants(session, params)
    data = [dict(row) for row in rows]

    if redis:
        try:
            await redis.setex(cache_key, settings.cache_ttl_seconds, json.dumps(data, default=str))
        except RedisError:
            pass

    return data


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

    await invalidate_namespace("restaurants:list")
    return dict(row)


async def delete_restaurant(session: AsyncSession, restaurant_id: str) -> None:
    deleted = await restaurant_repository.delete_restaurant(session, restaurant_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Restaurant not found.")

    await invalidate_namespace("restaurants:list")


def _validate_geo_params(params: RestaurantQueryParams) -> None:
    has_partial_geo = (params.lat is None) ^ (params.lon is None)
    if has_partial_geo:
        raise HTTPException(status_code=400, detail="lat and lon must be provided together.")

    if params.radius_km is not None and params.radius_km <= 0:
        raise HTTPException(status_code=400, detail="radiusKm must be greater than 0.")
