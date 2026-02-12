FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app/backend

COPY backend/pyproject.toml ./pyproject.toml
COPY backend/README.md ./README.md
RUN pip install --no-cache-dir --upgrade pip && pip install --no-cache-dir -e .

COPY backend/ .

EXPOSE 3000

CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "3000"]
