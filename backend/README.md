# LazyMeal Backend

FastAPI backend for LazyMeal.

## Local development (uv)

Install dependencies:

```bash
uv sync --project backend
```

Run API:

```bash
uv run --directory backend uvicorn app.main:app --reload --host 0.0.0.0 --port 3000
```

Required environment variables for auth:

```env
JWT_SECRET_KEY=CHANGE_ME_TO_A_LONG_RANDOM_SECRET
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7
```
