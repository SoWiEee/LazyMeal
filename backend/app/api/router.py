from fastapi import APIRouter

from app.api.routes import restaurants, watchlist

api_router = APIRouter()
api_router.include_router(restaurants.router)
api_router.include_router(watchlist.router)
