import math

import httpx

from app.core.config import get_settings

GOOGLE_PLACES_API_URL = "https://maps.googleapis.com/maps/api/place/textsearch/json"


async def search_google_restaurants(query: str, lat: float, lon: float) -> list[dict]:
    settings = get_settings()
    if not settings.maps_api_key:
        raise ValueError("Google Maps API Key is not configured.")

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(
            GOOGLE_PLACES_API_URL,
            params={
                "query": query,
                "location": f"{lat},{lon}",
                "radius": 10000,
                "key": settings.maps_api_key,
                "language": "zh-TW",
            },
        )

    payload = response.json()
    if payload.get("status") not in {"OK", "ZERO_RESULTS"}:
        raise RuntimeError(payload.get("error_message", "Unknown Google Places API error"))

    restaurants = []
    for place in payload.get("results", []):
        place_lat = place["geometry"]["location"]["lat"]
        place_lon = place["geometry"]["location"]["lng"]

        restaurants.append(
            {
                "place_id": place["place_id"],
                "name": place["name"],
                "address": place.get("formatted_address", ""),
                "latitude": place_lat,
                "longitude": place_lon,
                "rating": place.get("rating"),
                "user_ratings_total": place.get("user_ratings_total"),
                "distance_meters": _haversine_meters(lat, lon, place_lat, place_lon),
            }
        )

    return sorted(restaurants, key=lambda item: item["distance_meters"])


def _haversine_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r = 6371000
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    )
    return r * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
