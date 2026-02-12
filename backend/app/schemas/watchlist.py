from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class GoogleSearchResult(BaseModel):
    place_id: str
    name: str
    address: str
    latitude: float
    longitude: float
    rating: float | None = None
    user_ratings_total: int | None = None
    distance_meters: float | None = None


class WatchlistCreateRequest(BaseModel):
    place_id: str = Field(min_length=5, max_length=255)
    name: str = Field(min_length=1, max_length=255)
    address: str = Field(min_length=1, max_length=500)
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    rating: float | None = None
    user_ratings_total: int | None = None


class WatchlistRestaurantResponse(BaseModel):
    id: UUID
    googlePlaceId: str | None = None
    name: str
    address: str | None = None
    rating: float | None = None
    userRatingsTotal: int | None = None
    priceRange: str | None = None
    cuisine: list[str]
    latitude: float
    longitude: float
    addedAt: datetime


class WatchlistCreateResponse(BaseModel):
    message: str = Field(default="Restaurant added to watchlist successfully!")
    restaurant: WatchlistRestaurantResponse
