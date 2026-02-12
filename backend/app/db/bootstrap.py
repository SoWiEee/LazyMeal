from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine


async def ensure_watchlist_schema(engine: AsyncEngine) -> None:
    """Create tables required by watchlist flows in fresh environments."""
    async with engine.begin() as connection:
        await connection.execute(
            text(
                """
                CREATE TABLE IF NOT EXISTS restaurants (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    cuisine TEXT[] NOT NULL,
                    "priceRange" TEXT,
                    latitude DOUBLE PRECISION NOT NULL,
                    longitude DOUBLE PRECISION NOT NULL,
                    address TEXT,
                    phone TEXT,
                    "googlePlaceId" TEXT UNIQUE,
                    rating DOUBLE PRECISION,
                    "userRatingsTotal" INTEGER,
                    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
                )
                """
            )
        )
        await connection.execute(
            text(
                """
                CREATE INDEX IF NOT EXISTS restaurants_price_range_idx
                ON restaurants ("priceRange")
                """
            )
        )
        await connection.execute(
            text(
                """
                CREATE INDEX IF NOT EXISTS restaurants_created_at_desc_idx
                ON restaurants ("createdAt" DESC)
                """
            )
        )

        await connection.execute(
            text(
                """
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    username TEXT NOT NULL UNIQUE,
                    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
                )
                """
            )
        )
        await connection.execute(
            text(
                """
                CREATE TABLE IF NOT EXISTS user_restaurants (
                    id TEXT PRIMARY KEY,
                    "userId" TEXT NOT NULL,
                    "restaurantId" TEXT NOT NULL,
                    "addedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                    CONSTRAINT user_restaurants_user_fk
                        FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE,
                    CONSTRAINT user_restaurants_restaurant_fk
                        FOREIGN KEY ("restaurantId") REFERENCES restaurants(id) ON DELETE CASCADE,
                    CONSTRAINT user_restaurants_user_restaurant_unique
                        UNIQUE ("userId", "restaurantId")
                )
                """
            )
        )
        await connection.execute(
            text(
                """
                CREATE INDEX IF NOT EXISTS idx_user_restaurants_user_added_at
                ON user_restaurants ("userId", "addedAt" DESC)
                """
            )
        )
        await connection.execute(
            text(
                """
                CREATE INDEX IF NOT EXISTS idx_user_restaurants_restaurant_id
                ON user_restaurants ("restaurantId")
                """
            )
        )
