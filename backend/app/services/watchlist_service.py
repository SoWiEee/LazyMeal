from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.restaurant_repository import upsert_restaurant_from_place
from app.repositories.watchlist_repository import (
    add_to_watchlist,
    ensure_default_user,
    get_watchlist,
    remove_from_watchlist,
)
from app.services.google_places_service import search_google_restaurants

DEFAULT_USER_ID = "1337"


async def search_google(query: str, lat: float, lon: float) -> list[dict]:
    if not query:
        raise HTTPException(status_code=400, detail="Missing search query.")
    return await search_google_restaurants(query=query, lat=lat, lon=lon)


async def add_watchlist_item(session: AsyncSession, payload: dict) -> dict:
    user_id = await ensure_default_user(session, DEFAULT_USER_ID)
    restaurant = await upsert_restaurant_from_place(
        session,
        {
            **payload,
            "cuisine": [],
            "priceRange": None,
        },
    )

    try:
        await add_to_watchlist(session, user_id=user_id, restaurant_id=str(restaurant["id"]))
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc

    return {
        "message": "Restaurant added to watchlist successfully!",
        "restaurant": {
            "id": restaurant["id"],
            "googlePlaceId": restaurant["googlePlaceId"],
            "name": restaurant["name"],
            "address": restaurant["address"],
            "rating": restaurant["rating"],
            "userRatingsTotal": restaurant["userRatingsTotal"],
            "priceRange": restaurant["priceRange"],
            "cuisine": restaurant["cuisine"],
            "latitude": restaurant["latitude"],
            "longitude": restaurant["longitude"],
            "addedAt": restaurant["updatedAt"],
        },
    }


async def list_watchlist(session: AsyncSession) -> list[dict]:
    user_id = await ensure_default_user(session, DEFAULT_USER_ID)
    rows = await get_watchlist(session, user_id)
    return [dict(row) for row in rows]


async def delete_watchlist_item(session: AsyncSession, google_place_id: str) -> None:
    user_id = await ensure_default_user(session, DEFAULT_USER_ID)
    deleted = await remove_from_watchlist(session, user_id, google_place_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Restaurant not found in your watchlist.")
