from fastapi import APIRouter

from app.api.routes import auth, restaurants, watchlist

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(restaurants.router)
api_router.include_router(watchlist.router)
