from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine

from app.core.config import get_settings
from app.core.security import hash_password


async def ensure_watchlist_schema(engine: AsyncEngine) -> None:
    """Create tables required by watchlist flows in fresh environments."""
    settings = get_settings()
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
                    role TEXT NOT NULL DEFAULT 'user',
                    "passwordHash" TEXT,
                    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
                )
                """
            )
        )
        await connection.execute(
            text("ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'")
        )
        await connection.execute(
            text('ALTER TABLE users ADD COLUMN IF NOT EXISTS "passwordHash" TEXT')
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

        if settings.initial_admin_username and settings.initial_admin_password:
            await connection.execute(
                text(
                    '''
                    INSERT INTO users (id, username, role, "passwordHash", "createdAt", "updatedAt")
                    VALUES (:id, :username, 'admin', :password_hash, NOW(), NOW())
                    ON CONFLICT (username) DO NOTHING
                    '''
                ),
                {
                    "id": "admin-bootstrap",
                    "username": settings.initial_admin_username,
                    "password_hash": hash_password(settings.initial_admin_password),
                },
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
