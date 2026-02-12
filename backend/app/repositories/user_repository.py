from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


async def get_user_by_username(session: AsyncSession, username: str) -> dict | None:
    result = await session.execute(
        text(
            'SELECT id, username, role, "passwordHash" FROM users WHERE username = :username LIMIT 1'
        ),
        {"username": username},
    )
    return result.mappings().first()


async def get_user_by_id(session: AsyncSession, user_id: str) -> dict | None:
    result = await session.execute(
        text('SELECT id, username, role, "passwordHash" FROM users WHERE id = :user_id LIMIT 1'),
        {"user_id": user_id},
    )
    return result.mappings().first()


async def create_user(
    session: AsyncSession,
    user_id: str,
    username: str,
    password_hash: str,
    role: str,
) -> dict:
    result = await session.execute(
        text(
            '''
            INSERT INTO users (id, username, role, "passwordHash", "createdAt", "updatedAt")
            VALUES (:id, :username, :role, :password_hash, NOW(), NOW())
            RETURNING id, username, role, "passwordHash"
            '''
        ),
        {
            "id": user_id,
            "username": username,
            "role": role,
            "password_hash": password_hash,
        },
    )
    await session.commit()
    return result.mappings().one()

