# LazyMeal


# Introduction
A web application for choose lunch/dinner easily !

* [API Document](https://github.com/SoWiEee/LazyMeal/blob/main/docs/API%20Docs.md)
* [DeepWiki](https://deepwiki.com/SoWiEee/LazyMeal)

# Requirements
* Node.js `v22.17.0`
* PostgreSQL `v17.5`

# Quick Started

1. Build environment with following commands:

```Bash
# clone repo
git clone https://github.com/SoWiEee/LazyMeal.git
cd /LazyMeal

# install dependencies
npm install
yarn install
```

2. Create `.env` file at `/backend`

```
PORT = 3000
HOST = 0.0.0.0

DATABASE_URL = "postgresql://[USERNAME]:[PASSWROD]@[HOSTNAME]:[PORT]/[DB_NAME]?schema=public"
# e.g. "postgresql://foo:bar@localhost:5432/mydatabase?schema=public"

CORS_ORIGIN = [ALLOWED_ORIGIN]

# Google Maps API Key (you should active Places API in GCP)
Maps_API_KEY = YOUR_PLACES_API_KEY
```

3. Initialize database:
    * create empty table in PostgreSQL, like `food_db`
    * Prisma migration：according `prisma/schema.prisma` to build scheme

```Bash
npx prisma migrate dev --name init_database
```

4. Launch dev server (3000 port)

```Bash
npm run dev
yarn dev
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

| 參數                             | 說明                                             |
|----------------------------------|--------------------------------------------------|
| id                               | 主鍵(UUID)                                       |
| userId                           | 關聯的使用者 ID                                  |
| restaurantId                     | 關聯的餐廳 ID                                    |
| addedAt                          | 添加到口袋名單的時間                             |
| user                             | 與 User 模型的多對一關係                         |
| restaurant                       | 與 Restaurant 模型的多對一關係                   |
| @@unique([userId, restaurantId]) | 複合唯一索引，確保同一使用者不會重複收藏同一餐廳 |
