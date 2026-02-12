# 📚 LazyMeal API Documentation

This document describes the HTTP API exposed by LazyMeal.

- Base URL (local): `http://localhost:3000`
- Interactive Swagger UI: `/docs`
- Content type: `application/json`

---

## 🔐 Authentication

At the moment, watchlist operations use a fixed demo user (`userId = 1337`) for legacy compatibility. There is no JWT/session auth yet.

---

## 🧭 API Conventions

- Geo filters (`lat`, `lon`, `radiusKm`) should be provided together for distance-based filtering.
- `cuisine` supports comma-separated values (example: `Japanese,Korean`).
- Error responses generally follow this format:

```json
{
  "message": "Human-readable error message",
  "error": "Optional technical details"
}
```

---

## 🍽️ Restaurants API (`/api/restaurants`)

System-level restaurant query and management endpoints.

### 1) Get restaurants (with optional filters)

- **Method:** `GET`
- **Path:** `/api/restaurants`

#### Query Parameters

| Name | Type | Required | Description |
|---|---|---:|---|
| `search` | string | No | Fuzzy search by restaurant name |
| `cuisine` | string | No | Cuisine list (comma-separated) |
| `priceRange` | string | No | Price tier (for example: `LOW`, `MEDIUM`, `HIGH`) |
| `lat` | number | No | User latitude |
| `lon` | number | No | User longitude |
| `radiusKm` | number | No | Search radius in kilometers |

#### 200 Response

```json
[
  {
    "id": "uuid-1",
    "name": "McDonald's Kaohsiung Niaosong",
    "cuisine": ["American", "Fast Food"],
    "priceRange": "MEDIUM",
    "latitude": 22.6596457,
    "longitude": 120.3638982,
    "address": "No. 251, Zhongzheng Rd., Niaosong Dist., Kaohsiung",
    "phone": "07-732-1390",
    "googlePlaceId": "ChIJpSEoBS9AbjQRhMZ8OYlllbc",
    "rating": 4.1,
    "userRatingsTotal": 2852,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
]
```

#### Error Responses
- `500 Internal Server Error`

---

### 2) Get one random restaurant

- **Method:** `GET`
- **Path:** `/api/restaurants/random`

Uses the same query filters as `GET /api/restaurants`, then returns one random match.

#### 200 Response

```json
{
  "id": "uuid-1",
  "name": "McDonald's Kaohsiung Niaosong",
  "cuisine": ["Fast Food"],
  "priceRange": "MEDIUM",
  "latitude": 22.6596457,
  "longitude": 120.3638982,
  "address": "No. 251, Zhongzheng Rd., Niaosong Dist., Kaohsiung",
  "phone": "07-732-1390",
  "googlePlaceId": "ChIJpSEoBS9AbjQRhMZ8OYlllbc",
  "rating": 4.1,
  "userRatingsTotal": 2852,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

#### Error Responses
- `404 Not Found` (no restaurant matches current filters)
- `500 Internal Server Error`

---

### 3) Get restaurant by ID

- **Method:** `GET`
- **Path:** `/api/restaurants/{id}`

#### Path Parameters

| Name | Type | Description |
|---|---|---|
| `id` | string (UUID) | Restaurant UUID |

#### Error Responses
- `404 Not Found`
- `500 Internal Server Error`

---

### 4) Update restaurant (admin-oriented)

- **Method:** `PUT`
- **Path:** `/api/restaurants/{id}`

#### Request Body Example

```json
{
  "name": "McDonald's Kaohsiung Wufu",
  "cuisine": ["Fast Food", "American"],
  "priceRange": "HIGH",
  "latitude": 22.6236752,
  "longitude": 120.3021634,
  "address": "No. 258, Wufu 2nd Rd., Xinxing Dist., Kaohsiung",
  "phone": "09xx-xxxxxx"
}
```

#### Error Responses
- `404 Not Found`
- `500 Internal Server Error`

---

### 5) Delete restaurant (admin-oriented)

- **Method:** `DELETE`
- **Path:** `/api/restaurants/{id}`

#### Success Response
- `204 No Content`

#### Error Responses
- `404 Not Found`
- `500 Internal Server Error`

---

## ⭐ Watchlist API (`/api/watchlist`)

Personal watchlist endpoints.

### 1) Search restaurants from Google Places

- **Method:** `GET`
- **Path:** `/api/watchlist/search-google`
- **Example:** `/api/watchlist/search-google?query=McDonald's&lat=22.6865&lon=120.3015`

#### Query Parameters

| Name | Type | Required | Description |
|---|---|---:|---|
| `query` | string | Yes | Restaurant keyword/name |
| `lat` | number | Yes | User latitude |
| `lon` | number | Yes | User longitude |

#### 200 Response

```json
[
  {
    "place_id": "ChIJzW_WJgwFbjQRMgZRFE_9pgA",
    "name": "McDonald's - Kaohsiung Boai",
    "address": "No. 225, Boai 3rd Rd., Zuoying Dist., Kaohsiung",
    "latitude": 22.6742789,
    "longitude": 120.3047002,
    "rating": 4.1,
    "user_ratings_total": 3842,
    "distance_meters": 1392.742
  }
]
```

#### Error Responses
- `400 Bad Request` (missing/invalid params)
- `500 Internal Server Error` (Google API integration failure)

---

### 2) Add restaurant to watchlist

- **Method:** `POST`
- **Path:** `/api/watchlist`

#### Request Body Example

```json
{
  "google_place_id": "ChIJzW_WJgwFbjQRMgZRFE_9pgA",
  "name": "McDonald's - Kaohsiung Boai",
  "address": "No. 225, Boai 3rd Rd., Zuoying Dist., Kaohsiung",
  "latitude": 22.6742789,
  "longitude": 120.3047002,
  "rating": 4.1,
  "user_ratings_total": 3842,
  "cuisine": ["Fast Food"],
  "price_range": "MEDIUM",
  "phone": "07-0000-0000"
}
```

#### Success Response
- `201 Created` (or `200 OK` depending on implementation details)

#### Error Responses
- `400 Bad Request`
- `404 Not Found`
- `500 Internal Server Error`

---

### 3) Get watchlist

- **Method:** `GET`
- **Path:** `/api/watchlist`

Returns the current user's saved restaurants.

#### Error Responses
- `500 Internal Server Error`

---

### 4) Remove watchlist item by Google Place ID

- **Method:** `DELETE`
- **Path:** `/api/watchlist/{google_place_id}`

#### Path Parameters

| Name | Type | Description |
|---|---|---|
| `google_place_id` | string | Google place identifier |

#### Success Response
- `204 No Content` (or `200 OK` depending on implementation details)

#### Error Responses
- `404 Not Found`
- `500 Internal Server Error`

---

## 🧪 Testing API Quickly

You can verify API behavior with Swagger UI:

- `http://localhost:3000/docs`

Or use cURL examples:

```bash
curl "http://localhost:3000/api/restaurants?search=burger"
curl "http://localhost:3000/api/restaurants/random?cuisine=Fast%20Food"
curl "http://localhost:3000/api/watchlist/search-google?query=sushi&lat=25.0330&lon=121.5654"
```
