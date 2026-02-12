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
