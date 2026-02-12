from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class RestaurantQueryParams(BaseModel):
    search: str | None = Field(default=None, min_length=1, max_length=120)
    cuisine: list[str] = Field(default_factory=list)
    price_range: str | None = Field(default=None, alias="priceRange")
    lat: float | None = Field(default=None, ge=-90, le=90)
    lon: float | None = Field(default=None, ge=-180, le=180)
    radius_km: float | None = Field(default=None, alias="radiusKm", gt=0, le=50)


class RestaurantResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    cuisine: list[str]
    priceRange: str | None = None
    latitude: float
    longitude: float
    address: str | None = None
    phone: str | None = None
    googlePlaceId: str | None = None
    rating: float | None = None
    userRatingsTotal: int | None = None
    createdAt: datetime
    updatedAt: datetime


class RestaurantUpdateRequest(BaseModel):
    name: str | None = None
    cuisine: list[str] | None = None
    priceRange: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    address: str | None = None
    phone: str | None = None
    googlePlaceId: str | None = None
    rating: float | None = None
    userRatingsTotal: int | None = None
