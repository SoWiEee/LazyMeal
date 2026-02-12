# LazyMeal

LazyMeal 是一個幫助使用者快速決定午餐/晚餐的 Web 應用程式。前端負責互動與呈現，後端已重構為 **Python 3.14 + FastAPI**，並採用分層架構（Router / Service / Repository）以提升可維護性與擴充性。

## 主要功能
- 依條件查詢餐廳（名稱、菜系、價格、距離）
- 從符合條件的餐廳中隨機挑選一間
- 透過 Google Places API 搜尋附近餐廳
- 將 Google 餐廳加入本地 watchlist（口袋名單）
- 查詢與移除 watchlist 項目

## 技術棧

### Frontend
- Vue（位於 `frontend/`）

### Backend
- Python 3.14
- FastAPI + Uvicorn
- SQLAlchemy (async) + asyncpg
- PostgreSQL + PostGIS
- httpx（串接 Google Places API）

## 系統需求
- Node.js `v22+`（前端開發）
- Python `3.14`
- PostgreSQL `v17+`
- 建議安裝 PostGIS extension（支援距離查詢）

## 使用 Docker Compose 啟動（建議）

### 1) 準備環境變數
可在專案根目錄建立 `.env`（供 `docker compose` 讀取）：

```env
Maps_API_KEY=YOUR_GOOGLE_PLACES_API_KEY
```

> 若未設定 `Maps_API_KEY`，與 Google Places 相關的功能將無法正常使用。

### 2) 啟動所有服務
在專案根目錄執行：

```bash
docker compose up --build
```

啟動後可使用：
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`
- Swagger: `http://localhost:3000/docs`
- PostgreSQL: `localhost:5432`（帳號/密碼/DB 預設皆為 `lazymeal`）

### 3) 背景執行與關閉
```bash
# 背景執行
docker compose up -d --build

# 停止與移除容器
docker compose down

# 同時移除資料庫 volume（清空資料）
docker compose down -v
```

## 快速啟動

### 1) 下載專案並安裝前端依賴
```bash
git clone https://github.com/SoWiEee/LazyMeal.git
cd LazyMeal
yarn install
```

### 2) 安裝後端依賴
建議使用虛擬環境：
```bash
python3.14 -m venv .venv
source .venv/bin/activate
pip install -e ./backend
```

### 3) 設定環境變數
在 `backend/.env` 建立以下內容：

```env
PORT=3000
HOST=0.0.0.0
DATABASE_URL=postgresql+asyncpg://[USERNAME]:[PASSWORD]@[HOSTNAME]:[PORT]/[DB_NAME]
CORS_ORIGIN=http://localhost:5173
Maps_API_KEY=YOUR_GOOGLE_PLACES_API_KEY
```

> `DATABASE_URL` 需要使用 SQLAlchemy async driver 格式：`postgresql+asyncpg://...`

### 4) 初始化資料庫
本專案保留 `backend/prisma/schema.prisma` 作為資料模型參考；請先建立資料庫並執行既有 migration。

```bash
cd backend
npx prisma migrate dev --name init_database
```

### 5) 啟動服務
在專案根目錄：

```bash
# 同時啟動前後端
yarn dev

# 僅啟動後端
yarn backend:dev

# 僅啟動前端
yarn frontend:dev
```

## 專案結構（重點）

```text
backend/
├── app/
│   ├── api/
│   │   ├── router.py                 # 匯總所有 API router
│   │   └── routes/
│   │       ├── restaurants.py        # /api/restaurants
│   │       └── watchlist.py          # /api/watchlist
│   ├── core/
│   │   └── config.py                 # Settings 管理（.env）
│   ├── db/
│   │   └── session.py                # SQLAlchemy async engine/session
│   ├── repositories/                 # DB 存取（SQL 查詢）
│   ├── schemas/                      # Pydantic 請求/回應模型
│   ├── services/                     # 業務流程與驗證邏輯
│   └── main.py                       # FastAPI 入口
├── prisma/
│   ├── schema.prisma
│   └── migrations/
└── pyproject.toml
```

---

## 資料流（Data Flow）

以下用「一般 API 呼叫」與「Google 搜尋加入 watchlist」兩條路徑說明。

### A. 一般餐廳查詢（`GET /api/restaurants`）
1. 前端送出查詢參數（如 `search`、`cuisine`、`lat/lon/radiusKm`）。
2. `routes/restaurants.py` 接收請求，透過 `Depends(get_db_session)` 取得 DB session。
3. `services/restaurant_service.py` 執行參數驗證（例如半徑需大於 0、經緯度成對提供）。
4. `repositories/restaurant_repository.py` 組 SQL 條件並查詢 PostgreSQL。
5. 查詢結果回到 Service，再由 Router 以 Pydantic response model 序列化為 JSON。
6. 回傳前端渲染。

### B. Google 搜尋 + 加入口袋名單
1. 前端呼叫 `GET /api/watchlist/search-google?query=...&lat=...&lon=...`。
2. `services/watchlist_service.py` 呼叫 `google_places_service.py`，由 httpx 向 Google Places API 取資料。
3. 服務層將結果補上距離資訊並排序後回傳前端。
4. 使用者在前端點擊收藏後，前端呼叫 `POST /api/watchlist`。
5. Service 先確認預設使用者（目前為 `1337`）存在，再將餐廳 upsert 到 `restaurants`。
6. 將 `(userId, restaurantId)` 寫入 `user_restaurants` 關聯表。
7. 回傳收藏成功資料，前端更新 watchlist UI。

### C. 移除口袋名單
1. 前端呼叫 `DELETE /api/watchlist/{google_place_id}`。
2. 後端以 `google_place_id` 找到餐廳，再刪除 `user_restaurants` 對應關聯。
3. 回傳 `204 No Content`，前端同步移除項目。

---

## API 文件
- 可直接使用 FastAPI 自動文件：
  - Swagger UI: `http://localhost:3000/docs`
  - ReDoc: `http://localhost:3000/redoc`
- 舊版文件仍保留於 `docs/API Docs.md`（內容可能與新實作略有差異）。

## 備註
- 目前 watchlist 仍使用固定使用者 `1337`（與原專案行為一致），未來可改為 JWT/Auth 系統。
- 若要在地理篩選中使用 `ST_DWithin`，請確認資料庫已啟用 PostGIS。
