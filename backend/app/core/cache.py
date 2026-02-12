import hashlib
import json
from functools import lru_cache

from redis.asyncio import Redis

from app.core.config import get_settings


@lru_cache
def get_redis_client() -> Redis | None:
    settings = get_settings()
    if not settings.redis_url:
        return None

    return Redis.from_url(settings.redis_url, decode_responses=True)


def build_cache_key(namespace: str, payload: dict) -> str:
    normalized = json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
    digest = hashlib.sha256(normalized.encode("utf-8")).hexdigest()
    return f"{namespace}:{digest}"


async def invalidate_namespace(namespace: str) -> None:
    redis = get_redis_client()
    if not redis:
        return

    keys: list[str] = []
    async for key in redis.scan_iter(match=f"{namespace}:*"):
        keys.append(key)

    if keys:
        await redis.delete(*keys)
