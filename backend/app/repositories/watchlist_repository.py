from collections.abc import Sequence
from uuid import uuid4

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


async def ensure_default_user(session: AsyncSession, user_id: str = "1337") -> str:
    select_query = text('SELECT id FROM users WHERE id = :user_id')
    existing = await session.execute(select_query, {"user_id": user_id})
    row = existing.first()

    if row:
        return user_id

    create_query = text(
        """
        INSERT INTO users (id, username, "createdAt", "updatedAt")
        VALUES (:user_id, :username, NOW(), NOW())
        RETURNING id
        """
    )
    result = await session.execute(create_query, {"user_id": user_id, "username": f"test_user_{user_id}"})
    await session.commit()
    return result.scalar_one()


async def add_to_watchlist(session: AsyncSession, user_id: str, restaurant_id: str) -> None:
    query = text(
        """
        INSERT INTO user_restaurants (id, "userId", "restaurantId", "addedAt")
        VALUES (:id, :user_id, :restaurant_id, NOW())
        ON CONFLICT ("userId", "restaurantId") DO NOTHING
        """
    )
    result = await session.execute(
        query,
        {"id": str(uuid4()), "user_id": user_id, "restaurant_id": restaurant_id},
    )
    await session.commit()

    if result.rowcount == 0:
        raise ValueError("Restaurant already in your watchlist.")


async def get_watchlist(session: AsyncSession, user_id: str) -> Sequence[dict]:
    query = text(
        """
        SELECT
            r.id,
            r."googlePlaceId",
            r.name,
            r.address,
            r.rating,
            r."userRatingsTotal",
            r."priceRange",
            r.cuisine,
            r.latitude,
            r.longitude,
            ur."addedAt"
        FROM user_restaurants ur
        JOIN restaurants r ON r.id = ur."restaurantId"
        WHERE ur."userId" = :user_id
        ORDER BY ur."addedAt" DESC
        """
    )
    result = await session.execute(query, {"user_id": user_id})
    return result.mappings().all()


async def remove_from_watchlist(session: AsyncSession, user_id: str, google_place_id: str) -> bool:
    query = text(
        """
        DELETE FROM user_restaurants
        WHERE "userId" = :user_id
          AND "restaurantId" = (
            SELECT id FROM restaurants WHERE "googlePlaceId" = :google_place_id
          )
        """
    )
    result = await session.execute(query, {"user_id": user_id, "google_place_id": google_place_id})
    await session.commit()
    return result.rowcount > 0
