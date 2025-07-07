# LazyMeal


# Introduction
A web application for choose lunch/dinner easily !

# Requirements
* Node.js `v22.17.0`
* PostgreSQL `v17.5`

# Quick Started

1. Build environment with following commands:

```Bash
# clone repo
$ git clone https://github.com/SoWiEee/LazyMeal.git
$ cd /LazyMeal

# install dependencies
$ npm install   # yarn install
```

2. Create `.env` file at `/backend`

```
PORT = 3000
HOST = 0.0.0.0

DATABASE_URL = "postgresql://[使用者名稱]:[密碼]@[主機名稱]:[埠號]/[資料庫名稱]?schema=public"
# example: DATABASE_URL = "postgresql://user:password@localhost:5432/mydatabase?schema=public"

CORS_ORIGIN = http://localhost:5173

# Google Maps API Key
# 請確保已在 Google Cloud Platform 啟用 Places API
Maps_API_KEY = YOUR_API_KEY
```

3. Initialize database:
    * create empty table in PostgreSQL, like `restaurant_selector_db`
    * Prisma migration：according `prisma/schema.prisma` to build scheme

```Bash
$ npx prisma migrate dev --name init_database
```

4. Launch dev server (3000 port)

```Bash
$ npm run dev   # yarn dev
```

# Project Directory

```
backend/
├── src/
│   ├── routes/             # 定義所有 API 端點，將請求導向控制器
│   │   ├── restaurantRoutes.js  # 通用餐廳相關路由 (系統推薦、CRUD)
│   │   └── watchlistRoutes.js   # 使用者口袋名單相關路由
│   │
│   ├── controllers/        # 處理業務邏輯，調用服務層，並組裝回應
│   │   ├── restaurantController.js
│   │   └── watchlistController.js
│   │
│   ├── services/           # 處理數據層操作、外部 API 呼叫、複雜業務規則
│   │   ├── restaurantService.js   # 與餐廳資料庫互動
│   │   ├── googleMapsService.js   # 專門處理 Google Maps API 呼叫
│   │   └── watchlistService.js    # 與使用者口袋名單資料庫互動
│   │
│   ├── plugins/            # Fastify 插件，用於擴展 Fastify 功能 (例如掛載 Prisma Client)
│   │   └── prismaPlugin.js
│   │
│   ├── utils/              # 實用工具函式 (例如查詢參數解析、SQL 語句構建)
│   │   └── queryParser.js
│   └── server.js          # Fastify 應用程式入口點，註冊插件和路由
│
├── prisma/                 # Prisma ORM 相關文件
│   ├── schema.prisma       # 資料庫模式定義
│   └── migrations/         # 資料庫遷移記錄
│
├── .env                    # 環境變數設定（自行設置）
├── package.json
└── yarn.lock
```

# API Docs

## 通用餐廳相關 API `/api/restaurants`
* 這些 API 主要用於系統層面的餐廳數據查詢和管理。

### 獲取所有餐廳 (可篩選)
* URL：`/api/restaurants`
* Method：`GET`
* Description：根據提供的篩選條件，獲取所有符合條件的餐廳列表。

**Query Parameters**
    * search (string, 可選): 根據餐廳名稱進行模糊搜尋。
    * cuisine (string, 可選): 餐廳菜系 (例如 中式,西式，多個菜系用逗號分隔)。
    * priceRange (string, 可選): 價格範圍 (例如 低, 中, 高)。
    * lat (number, 可選): 使用者當前緯度。
    * lon (number, 可選): 使用者當前經度。
    * radiusKm (number, 可選): 搜尋半徑，單位公里。如果提供了 lat 和 lon，將根據此半徑篩選附近的餐廳。

**成功回應 (200 OK)**

```json

[
  {
    "id": "uuid-1",
    "name": "美味小吃",
    "cuisine": ["中式", "小吃"],
    "priceRange": "低",
    "latitude": 22.xxxx,
    "longitude": 120.xxxx,
    "address": "高雄市...",
    "phone": "07-...",
    "googlePlaceId": "ChIJ...",
    "rating": 4.2,
    "userRatingsTotal": 500,
    "createdAt": "2023-01-01T...",
    "updatedAt": "2023-01-01T..."
  }
]
```

**錯誤回應 (500 Internal Server Error)**

```json
{
  "message": "Error fetching restaurants",
  "error": "..."
}
```

### 隨機選擇餐廳
* URL：`/api/restaurants/random`
* Method：`GET`
* Description：在所有符合查詢參數篩選條件的餐廳中，隨機返回一家餐廳。

**成功回應 (200 OK)**

```json
{
  "id": "uuid-random",
  "name": "幸運餐廳",
  "cuisine": ["日式"],
  "priceRange": "中",
  "latitude": 22.xxxx,
  "longitude": 120.xxxx,
  "address": "高雄市...",
  "phone": "07-...",
  "googlePlaceId": "ChIJ...",
  "rating": 4.0,
  "userRatingsTotal": 300,
  "createdAt": "2023-01-01T...",
  "updatedAt": "2023-01-01T..."
}
```

**錯誤回應 (404 Not Found)**

```json
{
  "message": "No restaurants found matching criteria."
}
```

**錯誤回應 (500 Internal Server Error)**

```json
{
  "message": "Error selecting random restaurant",
  "error": "..."
}
```

### 獲取單一餐廳
* URL：`/api/restaurants/:id`
* Method：`GET`
* Description：根據餐廳的 UUID 獲取其詳細資訊。

**URL Parameters**

| 參數   | 說明           |
|-------|----------------|
| id    | 餐廳的 UUID     |

**成功回應 (200 OK)**
 (同隨機選擇餐廳的 JSON 格式)

**錯誤回應 (404 Not Found)**

```json
{
  "message": "Restaurant not found."
}
```

**錯誤回應 (500 Internal Server Error)**

```json
{
  "message": "Error fetching single restaurant",
  "error": "..."
}
```

### 更新餐廳 (管理員專用)
* URL：`/api/restaurants/:id`
* Method：`PUT`
* Description：更新指定 ID 餐廳的資訊。通常用於管理後台。

**URL Parameters**

| 參數   | 說明           |
|-------|----------------|
| id    | 餐廳的 UUID     |

**Request Body**

```json
{
  "name": "更新後的餐廳名稱",
  "cuisine": ["日式", "壽司"],
  "priceRange": "高",
  "latitude": 22.xxxx,
  "longitude": 120.xxxx,
  "address": "更新後的地址",
  "phone": "09xx-xxxxxx"
  // 其他可更新的欄位
}
```

**成功回應 (200 OK)**: (返回更新後的餐廳物件)

**錯誤回應 (404 Not Found)**

```json
{"message": "Restaurant not found."}
```

**錯誤回應 (500 Internal Server Error)**
```json
{"message": "Error updating restaurant", "error": "..."}
```

### 刪除餐廳 (管理員專用)
* URL：`/api/restaurants/:id`
* Method：`DELETE`
* Description：刪除指定 ID 的餐廳。通常用於管理後台。

**URL Parameters**

| 參數   | 說明           |
|-------|----------------|
| id    | 餐廳的 UUID     |

**成功回應 (204 No Content)**: (No response body)

**錯誤回應 (404 Not Found)**
```json
{"message": "Restaurant not found."}
```

**錯誤回應 (500 Internal Server Error)**
```json
 {"message": "Error deleting restaurant", "error": "..."}
```


## 使用者口袋名單相關 API `/api/watchlist`
* 這些 API 專門用於管理使用者的個人化口袋名單。

### 搜尋 Google Maps 餐廳
* URL：`/api/watchlist/search-google`
* Method：`GET`
* Description：根據使用者輸入的關鍵字和當前位置，向 Google Places API 發送搜尋請求，並返回相關餐廳列表。

**Query Parameters**

| 參數  | 說明             |
|-------|------------------|
| query | 餐廳名稱或關鍵字 |
| lat   | 使用者當前緯度   |
| lon   | 使用者當前經度   |

**成功回應 (200 OK)**

```json
[
  	{
      "place_id": "ChIJpSEoBS9AbjQRhMZ8OYlllbc",
      "name": "麥當勞-高雄鳥松餐廳",
      "address": "833, Taiwan, Kaohsiung City, Niaosong District, 中正路251號",
      "latitude": 22.6596457,
      "longitude": 120.3638982,
      "rating": 4.1,
      "user_ratings_total": 2852,
      "distance_meters": 7068.5311677
  	},
  	{
        "place_id": "ChIJwTSJiYYEbjQROLkM5AEfBX0",
        "name": "McDonald's Kaohsiung Wufu",
        "address": "No. 258號, Wufu 2nd Rd, Sinsing District, Kaohsiung City, Taiwan 800",
        "latitude": 22.6236752,
        "longitude": 120.3021634,
        "rating": 3.8,
        "user_ratings_total": 2704,
        "distance_meters": 6957.50328278
	}
]
```

**錯誤回應 (400 Bad Request)**

```json
{
  "message": "Missing search query."
}
```

**錯誤回應 (500 Internal Server Error)**

```json
{
  "message": "Failed to search Google Maps.",
  "error": "..."
}
```

### 添加餐廳到口袋名單
* URL：`/api/watchlist/add-to-watchlist`
* Method：`POST`
* Description：將 Google Maps 搜尋結果中的餐廳添加到當前使用者的口袋名單。如果餐廳尚未存在於本地資料庫，將先新增。

**Request Body**

```json
{
  "place_id": "ChIJ...",         // 必填，Google Place ID
  "name": "餐廳名稱",             // 必填
  "address": "餐廳地址",          // 必填
  "latitude": 22.xxxx,           // 必填
  "longitude": 120.xxxx,          // 必填
  "rating": 4.5,                 // 可選，Google 評價星數
  "user_ratings_total": 1234     // 可選，Google 評價總數
  // 其他可選的 Google 數據，如 phone, cuisine, priceRange (如果已處理)
}
```

**成功回應 (201 Created)**

```json
{
  "message": "Restaurant added to watchlist successfully!",
  "restaurant": { /* UserRestaurant 關聯物件 */ },
  "fullRestaurant": { /* Restaurant 完整物件，包含本地 ID 等 */ }
}
```

**錯誤回應 (400 Bad Request)**
```json
{"message": "Missing required restaurant data."}
```

**錯誤回應 (409 Conflict)**
```json
{"message": "Restaurant already in your watchlist."} (使用者已收藏此餐廳)
```

**錯誤回應 (500 Internal Server Error)**
```json
{"message": "Failed to add restaurant to watchlist.", "error": "..."}
```

### 從 Google Map 連結導入餐廳
* URL：`/api/watchlist/import-from-link`
* Method：`POST`
* Description：透過 Google Map 的分享連結，解析餐廳資訊並添加到使用者的口袋名單。

**Request Body**

```json
{
  "link": "https://maps.app.goo.gl/xxxxxxxxxxxxxxxxx" // 必填，Google Map 分享連結
}
```

**成功回應 (201 Created)**

```json
{
  "message": "Restaurant imported from link and added to watchlist!",
  "fullRestaurant": { /* Restaurant 完整物件 */ }
}
```

**錯誤回應 (400 Bad Request)**
```json
{"message": "Missing Google Maps link."} 或 {"message": "Could not extract Place ID from the provided link."}
```

**錯誤回應 (500 Internal Server Error)**
```json
{"message": "Failed to import restaurant from link.", "error": "..."}
```

### 獲取使用者口袋名單
* URL：`/api/watchlist`
* Method：`GET`
* Description：獲取當前使用者收藏的所有餐廳列表。

**成功回應 (200 OK)**

```json
[
  {
    "id": "local-restaurant-id-1",
    "googlePlaceId": "ChIJ...",
    "name": "我的收藏餐廳1",
    "address": "地址1",
    "rating": 4.8,
    "userRatingsTotal": 999,
    "priceRange": "中",
    "cuisine": ["日式"],
    "latitude": 22.xxxx,
    "longitude": 120.xxxx,
    "addedAt": "2023-01-01T..."
  },
  // ... 更多收藏的餐廳
]
```

**錯誤回應 (500 Internal Server Error)**
```json
{"message": "Failed to fetch watchlist.", "error": "..."}
```

### 從口袋名單中刪除餐廳
* URL：`/api/watchlist/:restaurantId`
* Method：`DELETE`
* Description：從當前使用者的口袋名單中移除指定 ID 的餐廳。

**URL Parameters**

*restaurantId (string, 必填): 要移除的餐廳的本地資料庫 ID。

**成功回應 (204 No Content)**: (No response body)

**錯誤回應 (404 Not Found)**
```json
{"message": "Restaurant not found in your watchlist."}
```

**錯誤回應 (500 Internal Server Error)**
```json
{"message": "Failed to delete restaurant from watchlist.", "error": "..."}
```

# Data Model

## Restaurant 模型
* 儲存餐廳的基本資訊，來自 Google Maps 或手動新增。

| 參數             | 說明                          |
|------------------|-------------------------------|
| id               | 主鍵(UUID)                    |
| name             | 餐廳名稱                      |
| cuisine          | 菜系                          |
| priceRange       | 價格範圍                      |
| latitude         | 緯度                          |
| longitude        | 經度                          |
| address          | 地址                          |
| phone            | 電話                          |
| googlePlaceId    | @unique, Google Maps Place ID |
| rating           | 評價星數                      |
| userRatingsTotal | 評價總數                      |
| createdAt        | 創建時間                      |
| updatedAt        | 最後更新時間                  |

## UserRestaurant 模型 (口袋名單關聯表)
* 記錄哪個使用者收藏了哪個餐廳，是 User 和 Restaurant 之間的關聯。

```
id: String (UUID), 主鍵
userId: String, 關聯的使用者 ID
restaurantId: String, 關聯的餐廳 ID
addedAt: DateTime, 添加到口袋名單的時間
user: User @relation, 與 User 模型的多對一關係
restaurant: Restaurant @relation, 與 Restaurant 模型的多對一關係
@@unique([userId, restaurantId]): 複合唯一索引，確保同一使用者不會重複收藏同一餐廳。
```