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
    place_id: str
    name: str
    address: str
    latitude: float
    longitude: float
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
