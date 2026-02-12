# 🍱 LazyMeal

LazyMeal is a full-stack web app that helps you quickly decide what to eat for lunch or dinner. It combines local restaurant data with Google Places search, then lets you save favorites into a personal watchlist.

> Backend is implemented with **Python 3.14 + FastAPI** using a layered architecture (**Router → Service → Repository**) for maintainability and scalability.

## ✨ Features

- Filter restaurants by name, cuisine, price range, and distance
- Randomly pick one restaurant from matched results
- Search nearby places through Google Places API
- Save Google results to a local watchlist
- List and remove items from watchlist
- Query performance optimization with PostgreSQL indexes + Redis cache

## 🧱 Tech Stack

### Frontend
- Vue (in `frontend/`)

### Backend
- Python 3.14
- FastAPI + Uvicorn
- SQLAlchemy (async) + asyncpg
- PostgreSQL + PostGIS
- httpx (Google Places API integration)
- Redis (query cache)

## ✅ Prerequisites

- Node.js `v22+`
- Python `3.14`
- PostgreSQL `v17+`
- PostGIS extension (required for geo-distance queries)

## 🚀 Quick Start (Docker Compose - Recommended)

### 1) Configure environment variables
Create `.env` in the project root:

```env
Maps_API_KEY=YOUR_GOOGLE_PLACES_API_KEY
```

If `Maps_API_KEY` is not set, Google Places related features will not work.

### 2) Start all services

```bash
docker compose up --build
```

After startup:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`
- Swagger UI: `http://localhost:3000/docs`
- PostgreSQL: `localhost:5432` (`lazymeal/lazymeal/lazymeal` by default)

### 3) Run in background / stop

```bash
# Run in background
docker compose up -d --build

# Stop and remove containers
docker compose down

# Stop and remove containers + database volume
docker compose down -v
```

## ⚡ Performance Notes

This project includes performance-focused database/index/cache settings:

- PostgreSQL indexes:
  - Trigram GIN index on `name` for fast `ILIKE`
  - GIN index on `cuisine` array filters
  - GiST geography index for `ST_DWithin`
  - Additional indexes such as `priceRange`, `createdAt`, and `user_restaurants(userId, addedAt)`
- Redis cache:
  - Restaurant list cache (`restaurants:list`)
  - Watchlist cache (`watchlist:list`)
  - Automatic cache invalidation on add/remove watchlist and restaurant updates

Override cache TTL via `.env`:

```env
CACHE_TTL_SECONDS=60
```

## 🛠️ Local Development Setup

### 1) Clone and install frontend dependencies

```bash
git clone https://github.com/SoWiEee/LazyMeal.git
cd LazyMeal
yarn install
```

### 2) Install backend dependencies (with uv)
Install [uv](https://docs.astral.sh/uv/):

```bash
# macOS / Linux
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Then from project root:

```bash
uv sync --project backend
```

### 3) Configure backend environment
Create `backend/.env`:

```env
PORT=3000
HOST=0.0.0.0
DATABASE_URL=postgresql+asyncpg://[USERNAME]:[PASSWORD]@[HOSTNAME]:[PORT]/[DB_NAME]
CORS_ORIGIN=http://localhost:5173
Maps_API_KEY=YOUR_GOOGLE_PLACES_API_KEY
REDIS_URL=redis://localhost:6379/0
CACHE_TTL_SECONDS=60
```

`DATABASE_URL` must use SQLAlchemy async driver format: `postgresql+asyncpg://...`

### 4) Initialize database
`backend/prisma/schema.prisma` is retained as a schema reference. Create database and apply migrations:

```bash
cd backend
npx prisma migrate dev --name init_database
```

### 5) Start development services
From project root:

```bash
# Start frontend + backend
yarn dev

# Start backend only (uv)
yarn backend:dev

# Start frontend only
yarn frontend:dev
```

## 🗂️ Project Structure

```text
backend/
├── app/
│   ├── api/
│   │   ├── router.py
│   │   └── routes/
│   │       ├── restaurants.py
│   │       └── watchlist.py
│   ├── core/
│   │   └── config.py
│   ├── db/
│   │   └── session.py
│   ├── repositories/
│   ├── schemas/
│   ├── services/
│   └── main.py
├── prisma/
│   ├── schema.prisma
│   └── migrations/
└── pyproject.toml
```

## 🔄 Data Flow

### A) Restaurant query (`GET /api/restaurants`)
1. Frontend sends query params (`search`, `cuisine`, `lat/lon/radiusKm`, etc.).
2. Router receives request and injects DB session.
3. Service validates business rules.
4. Repository builds SQL conditions and queries PostgreSQL.
5. Service returns domain result.
6. Router serializes response via Pydantic model.

### B) Google search + save to watchlist
1. Frontend calls `GET /api/watchlist/search-google?...`.
2. Watchlist service calls Google Places through `httpx`.
3. Results are enriched with distance and sorted.
4. Frontend submits `POST /api/watchlist` for a selected place.
5. Service upserts into `restaurants`.
6. Service writes `(userId, restaurantId)` into `user_restaurants`.
7. Updated watchlist is returned.

### C) Remove from watchlist
1. Frontend calls `DELETE /api/watchlist/{google_place_id}`.
2. Backend resolves restaurant by `google_place_id` and deletes mapping.
3. Related cache keys are invalidated.
4. API returns success.

## 📘 API Documentation

- Main API reference: `docs/API Docs.md`
- Interactive docs (when server is running): `http://localhost:3000/docs`

## 📝 Notes

- Watchlist currently uses a fixed demo user (`1337`) to match legacy behavior.
- PostGIS must be enabled for `ST_DWithin` geo filtering.
