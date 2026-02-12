from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "LazyMeal API"
    app_env: str = Field(default="development", alias="APP_ENV")
    host: str = Field(default="0.0.0.0", alias="HOST")
    port: int = Field(default=3000, alias="PORT")
    cors_origin: str = Field(default="http://localhost:5173", alias="CORS_ORIGIN")

    database_url: str = Field(alias="DATABASE_URL")
    maps_api_key: str | None = Field(default=None, alias="Maps_API_KEY")
    redis_url: str | None = Field(default=None, alias="REDIS_URL")
    cache_ttl_seconds: int = Field(default=60, alias="CACHE_TTL_SECONDS")
    jwt_secret_key: str = Field(alias="JWT_SECRET_KEY")
    jwt_algorithm: str = Field(default="HS256", alias="JWT_ALGORITHM")
    jwt_access_token_expire_minutes: int = Field(default=30, alias="JWT_ACCESS_TOKEN_EXPIRE_MINUTES")
    jwt_refresh_token_expire_days: int = Field(default=7, alias="JWT_REFRESH_TOKEN_EXPIRE_DAYS")
    initial_admin_username: str | None = Field(default=None, alias="INITIAL_ADMIN_USERNAME")
    initial_admin_password: str | None = Field(default=None, alias="INITIAL_ADMIN_PASSWORD")


@lru_cache
def get_settings() -> Settings:
    return Settings()
