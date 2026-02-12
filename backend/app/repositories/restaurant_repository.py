import secrets
from collections.abc import Sequence
from uuid import uuid4

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.restaurant import RestaurantQueryParams, RestaurantUpdateRequest

BASE_SELECT = """
SELECT
    id,
    name,
    cuisine,
    "priceRange",
    latitude,
    longitude,
    address,
    phone,
    "googlePlaceId",
    rating,
    "userRatingsTotal",
    "createdAt",
    "updatedAt"
FROM restaurants
"""


def _build_filters(params: RestaurantQueryParams) -> tuple[str, dict[str, object]]:
    conditions: list[str] = []
    values: dict[str, object] = {}

    if params.search:
        conditions.append('name ILIKE :search')
        values["search"] = f"%{params.search}%"

    if params.cuisine:
        conditions.append('cuisine @> CAST(:cuisine AS text[])')
        values["cuisine"] = params.cuisine

    if params.price_range:
        conditions.append('"priceRange" = :price_range')
        values["price_range"] = params.price_range

    if params.lat is not None and params.lon is not None and params.radius_km is not None:
        conditions.append(
            """
            ST_DWithin(
                ST_MakePoint(longitude, latitude)::geography,
                ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography,
                :radius_meters
            )
            """
        )
        values["lat"] = params.lat
        values["lon"] = params.lon
        values["radius_meters"] = params.radius_km * 1000

    clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""
    return clause, values


async def list_restaurants(session: AsyncSession, params: RestaurantQueryParams) -> Sequence[dict]:
    where_clause, values = _build_filters(params)
    query = text(f"{BASE_SELECT} {where_clause} ORDER BY \"createdAt\" DESC")  # nosec B608
    result = await session.execute(query, values)
    return result.mappings().all()


async def get_random_restaurant(session: AsyncSession, params: RestaurantQueryParams) -> dict | None:
    where_clause, values = _build_filters(params)
    count_query = text(f"SELECT COUNT(*) FROM restaurants {where_clause}")  # nosec B608
    count_result = await session.execute(count_query, values)
    count = count_result.scalar_one()

    if count == 0:
        return None

    offset = secrets.randbelow(count)
    random_query = text(f"{BASE_SELECT} {where_clause} OFFSET :offset LIMIT 1")  # nosec B608
    result = await session.execute(random_query, {**values, "offset": offset})
    return result.mappings().first()


async def get_restaurant_by_id(session: AsyncSession, restaurant_id: str) -> dict | None:
    query = text(f"{BASE_SELECT} WHERE id = :restaurant_id")  # nosec B608
    result = await session.execute(query, {"restaurant_id": restaurant_id})
    return result.mappings().first()


async def update_restaurant(
    session: AsyncSession, restaurant_id: str, payload: RestaurantUpdateRequest
) -> dict | None:
    data = payload.model_dump(exclude_none=True)
    if not data:
        return await get_restaurant_by_id(session, restaurant_id)

    allowed_columns = {
        "name": "name",
        "cuisine": "cuisine",
        "priceRange": '"priceRange"',
        "latitude": "latitude",
        "longitude": "longitude",
        "address": "address",
        "phone": "phone",
        "googlePlaceId": '"googlePlaceId"',
        "rating": "rating",
        "userRatingsTotal": '"userRatingsTotal"',
    }

    safe_data = {key: value for key, value in data.items() if key in allowed_columns}
    assignments = ", ".join([f"{allowed_columns[key]} = :{key}" for key in safe_data])
    query = text(
        f"""
        UPDATE restaurants
        SET {assignments}, "updatedAt" = NOW()
        WHERE id = :restaurant_id
        RETURNING id, name, cuisine, "priceRange", latitude, longitude,
                  address, phone, "googlePlaceId", rating, "userRatingsTotal", "createdAt", "updatedAt"
        """
    )  # nosec B608
    result = await session.execute(query, {**safe_data, "restaurant_id": restaurant_id})
    await session.commit()
    return result.mappings().first()


async def delete_restaurant(session: AsyncSession, restaurant_id: str) -> bool:
    query = text("DELETE FROM restaurants WHERE id = :restaurant_id")
    result = await session.execute(query, {"restaurant_id": restaurant_id})
    await session.commit()
    return result.rowcount > 0


async def upsert_restaurant_from_place(session: AsyncSession, payload: dict) -> dict:
    query = text(
        """
        INSERT INTO restaurants (
            id, name, cuisine, "priceRange", latitude, longitude, address,
            "googlePlaceId", rating, "userRatingsTotal", "createdAt", "updatedAt"
        ) VALUES (
            :id, :name, :cuisine, :price_range, :latitude, :longitude,
            :address, :google_place_id, :rating, :user_ratings_total, NOW(), NOW()
        )
        ON CONFLICT ("googlePlaceId") DO UPDATE
        SET name = EXCLUDED.name,
            latitude = EXCLUDED.latitude,
            longitude = EXCLUDED.longitude,
            address = EXCLUDED.address,
            rating = EXCLUDED.rating,
            "userRatingsTotal" = EXCLUDED."userRatingsTotal",
            "updatedAt" = NOW()
        RETURNING id, name, cuisine, "priceRange", latitude, longitude,
                  address, phone, "googlePlaceId", rating, "userRatingsTotal", "createdAt", "updatedAt"
        """
    )

    result = await session.execute(
        query,
        {
            "id": payload.get("id", str(uuid4())),
            "name": payload["name"],
            "cuisine": payload.get("cuisine", []),
            "price_range": payload.get("priceRange"),
            "latitude": payload["latitude"],
            "longitude": payload["longitude"],
            "address": payload["address"],
            "google_place_id": payload["place_id"],
            "rating": payload.get("rating"),
            "user_ratings_total": payload.get("user_ratings_total"),
        },
    )
    await session.commit()
    return result.mappings().one()
