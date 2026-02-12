import base64
import hashlib
import hmac
import secrets
from datetime import UTC, datetime, timedelta

import jwt

from app.core.config import get_settings


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 600000)
    return f"pbkdf2_sha256${base64.b64encode(salt).decode()}${base64.b64encode(digest).decode()}"


def verify_password(password: str, password_hash: str) -> bool:
    try:
        algorithm, salt_b64, digest_b64 = password_hash.split("$", maxsplit=2)
        if algorithm != "pbkdf2_sha256":
            return False
        salt = base64.b64decode(salt_b64)
        expected = base64.b64decode(digest_b64)
        calculated = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 600000)
    except Exception:
        return False

    return hmac.compare_digest(calculated, expected)


def _create_token(subject: str, role: str, token_type: str, expires_delta: timedelta) -> str:
    settings = get_settings()
    now = datetime.now(UTC)
    payload = {
        "sub": subject,
        "role": role,
        "type": token_type,
        "iat": now,
        "exp": now + expires_delta,
    }
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def create_access_token(subject: str, role: str) -> str:
    settings = get_settings()
    return _create_token(
        subject=subject,
        role=role,
        token_type="access",
        expires_delta=timedelta(minutes=settings.jwt_access_token_expire_minutes),
    )


def create_refresh_token(subject: str, role: str) -> str:
    settings = get_settings()
    return _create_token(
        subject=subject,
        role=role,
        token_type="refresh",
        expires_delta=timedelta(days=settings.jwt_refresh_token_expire_days),
    )


def decode_token(token: str) -> dict:
    settings = get_settings()
    return jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
