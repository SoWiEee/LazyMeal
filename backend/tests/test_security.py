import os

os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key")
os.environ.setdefault("DATABASE_URL", "postgresql+asyncpg://test:test@localhost:5432/test")

from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)


def test_password_hash_and_verify():
    password = "MyStrongPassword123!"
    password_hash = hash_password(password)

    assert password_hash.startswith("pbkdf2_sha256$")
    assert verify_password(password, password_hash)
    assert not verify_password("wrong-password", password_hash)


def test_access_and_refresh_token_types():
    access = create_access_token("user-1", "user")
    refresh = create_refresh_token("user-1", "user")

    access_payload = decode_token(access)
    refresh_payload = decode_token(refresh)

    assert access_payload["sub"] == "user-1"
    assert access_payload["role"] == "user"
    assert access_payload["type"] == "access"

    assert refresh_payload["sub"] == "user-1"
    assert refresh_payload["role"] == "user"
    assert refresh_payload["type"] == "refresh"
