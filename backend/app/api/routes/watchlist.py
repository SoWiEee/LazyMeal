from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.schemas.watchlist import (
    GoogleSearchResult,
    WatchlistCreateRequest,
    WatchlistCreateResponse,
    WatchlistRestaurantResponse,
)
from app.services import watchlist_service

router = APIRouter(prefix="/api/watchlist", tags=["watchlist"])


@router.get("/search-google", response_model=list[GoogleSearchResult])
async def search_google(
    query: str = Query(...),
    lat: float = Query(...),
    lon: float = Query(...),
) -> list[dict]:
    return await watchlist_service.search_google(query=query, lat=lat, lon=lon)


@router.post("", response_model=WatchlistCreateResponse, status_code=status.HTTP_201_CREATED)
async def add_to_watchlist(
    payload: WatchlistCreateRequest,
    session: AsyncSession = Depends(get_db_session),
) -> dict:
    return await watchlist_service.add_watchlist_item(session, payload.model_dump())


@router.get("", response_model=list[WatchlistRestaurantResponse])
async def get_watchlist(session: AsyncSession = Depends(get_db_session)) -> list[dict]:
    return await watchlist_service.list_watchlist(session)


@router.delete("/{google_place_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_watchlist(
    google_place_id: str,
    session: AsyncSession = Depends(get_db_session),
) -> Response:
    await watchlist_service.delete_watchlist_item(session, google_place_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
