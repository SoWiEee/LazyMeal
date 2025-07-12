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
		"name": "麥當勞-高雄鳥松餐廳",
		"cuisine": ["美式", "速食"],
		"priceRange": "中",
		"latitude": 22.6596457,
		"longitude": 120.3638982,
		"address": "833, Taiwan, Kaohsiung City, Niaosong District, 中正路251號",
		"phone": "07-732-1390",
		"googlePlaceId": "ChIJpSEoBS9AbjQRhMZ8OYlllbc",
		"rating": 4.1,
		"userRatingsTotal": 2852,
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
	"name": "麥當勞-高雄鳥松餐廳",
	"cuisine": ["速食"],
	"priceRange": "中",
	"latitude": 22.6596457,
	"longitude": 120.3638982,
	"address": "833, Taiwan, Kaohsiung City, Niaosong District, 中正路251號",
	"phone": "07-732-1390",
	"googlePlaceId": "ChIJpSEoBS9AbjQRhMZ8OYlllbc",
	"rating": 4.1,
	"userRatingsTotal": 2852,
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
	"name": "McDonald's Kaohsiung Wofo",
	"cuisine": ["速食", "美式"],
	"priceRange": "高",
	"latitude": 22.6236752,
	"longitude": 120.3021634,
	"address": "No. 258號, Wufu 2nd Rd, Sinsing District, Kaohsiung City, Taiwan 870",
	"phone": "09xx-xxxxxx"
	// ... more fields
}
```

**成功回應 (200 OK)**: (返回更新後的餐廳物件)

**錯誤回應 (404 Not Found)**

```json
{
	"message": "Restaurant not found."
}
```

**錯誤回應 (500 Internal Server Error)**
```json
{
	"message": "Error updating restaurant",
	"error": "..."
}
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
{
	"message": "Restaurant not found."
}
```

**錯誤回應 (500 Internal Server Error)**
```json
{
	"message": "Error deleting restaurant",
	"error": "..."
}
```


## 使用者口袋名單相關 API `/api/watchlist`（KeyPoint）
* 這些 API 專門用於管理使用者的個人化口袋名單。

### 搜尋 Google Maps 餐廳（Finished）
* URL：`/api/watchlist/search-google`
* Method：`GET`
* Description：根據使用者輸入的關鍵字和當前位置，向 Google Places API 發送搜尋請求，並返回相關餐廳列表。
* Example：`/api/watchlist/search-google?&query=麥當勞&lat=22.6865&lon=120.3015`

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
		"place_id": "ChIJzW_WJgwFbjQRMgZRFE_9pgA",
		"name": "麥當勞－高雄博愛二餐廳－設有得來速",
		"address": "813台灣高雄市左營區博愛三路225號",
		"latitude": 22.6742789,
		"longitude": 120.3047002,
		"rating": 4.1,
		"user_ratings_total": 3842,
		"distance_meters": 1392.74201703
	},
	{
		"place_id": "ChIJ65KkIAwFbjQRXSOTYACKSSg",
		"name": "麥當勞-高雄左營餐廳",
		"address": "813台灣高雄市左營區左營大路81號",
		"latitude": 22.6822493,
		"longitude": 120.2881999,
		"rating": 4.1,
		"user_ratings_total": 1546,
		"distance_meters": 1445.50109741
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
* URL：`/api/watchlist/`
* Method：`POST`
* Description：將 Google Maps 搜尋結果中的餐廳添加到當前使用者的口袋名單。如果餐廳尚未存在於本地資料庫，將先新增。

> 接收 `restaurant` 物件(body)，並在本地資料庫紀錄該餐廳資訊，並回傳完整物件 `fullRestaurant` 給前端

**Request Body**

```json
{
    "place_id": "ChIJN64Mm1kDbjQR5JTFxQ4Cx2U",
    "name": "麥當勞-高雄瑞隆餐廳",
    "address": "806台灣高雄市前鎮區瑞隆路432號1樓",
    "latitude": 22.6054811,
    "longitude": 120.3296335,
    "rating": 3.9,
    "user_ratings_total": 3230
}
```

**成功回應 (201 Created)**

```json
{
	"message": "Restaurant added to watchlist successfully!",
	"restaurant": {
		"id": "2125ae13-b8e3-4e7d-959e-fcf56ee23d27",
		"userId": "1337",
		"restaurantId": "0031759b-18f7-4e9b-94f7-961b1e299a73",
		"addedAt": "2025-07-12T13:20:13.489Z",
		"restaurant": {
			"id": "0031759b-18f7-4e9b-94f7-961b1e299a73",
			"name": "麥當勞-高雄瑞隆餐廳",
			"cuisine": [],
			"priceRange": null,
			"latitude": 22.6054811,
			"longitude": 120.3296335,
			"address": "806台灣高雄市前鎮區瑞隆路432號1樓",
			"phone": null,
			"googlePlaceId": "ChIJN64Mm1kDbjQR5JTFxQ4Cx2U",
			"rating": 3.9,
			"userRatingsTotal": 3230,
			"createdAt": "2025-07-12T13:20:13.487Z",
			"updatedAt": "2025-07-12T13:20:13.487Z"
		}
	},
	"fullRestaurant": {
			"id": "0031759b-18f7-4e9b-94f7-961b1e299a73",
			"name": "麥當勞-高雄瑞隆餐廳",
			"cuisine": [],
			"priceRange": null,
			"latitude": 22.6054811,
			"longitude": 120.3296335,
			"address": "806台灣高雄市前鎮區瑞隆路432號1樓",
			"phone": null,
			"googlePlaceId": "ChIJN64Mm1kDbjQR5JTFxQ4Cx2U",
			"rating": 3.9,
			"userRatingsTotal": 3230,
			"createdAt": "2025-07-12T13:20:13.487Z",
			"updatedAt": "2025-07-12T13:20:13.487Z"
	}
}
```

**錯誤回應 (400 Bad Request)**
```json
{
    "statusCode": 400,
    "error": "Bad Request",
    "message": "Expected double-quoted property name in JSON at position 231 (line 9 column 1)"	// error detail
}
```

**錯誤回應 (409 Conflict)**
```json
{
	"message": "Restaurant already in your watchlist."
}
```

**錯誤回應 (500 Internal Server Error)**
```json
{
	"message": "Failed to add restaurant to watchlist.",
	"error": "..."
}
```

### 從 Google Map 連結導入餐廳
* URL：`/api/watchlist/import-from-link`
* Method：`POST`
* Description：透過 Google Map 的分享連結，解析餐廳資訊並添加到使用者的口袋名單。

**Request Body**

```json
{
  "link": "https://share.google/mAaFtPHFSZmOVAR6y"
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
{
	"message": "Missing Google Maps link."
}

// or

{
	"message": "Could not extract Place ID from the provided link."
}
```

**錯誤回應 (500 Internal Server Error)**
```json
{
	"message": "Failed to import restaurant from link.",
	"error": "..."
}
```

### 獲取使用者口袋名單（Finished）
* URL：`/api/watchlist`
* Method：`GET`
* Description：獲取當前使用者收藏的所有餐廳列表。

> 目前沒有管理使用者，預設是獲取 ID=1337 的口袋名單。

**成功回應 (200 OK)**

```json
[
    {
        "id": "0031759b-18f7-4e9b-94f7-961b1e299a73",
        "googlePlaceId": "ChIJN64Mm1kDbjQR5JTFxQ4Cx2U",
        "name": "麥當勞-高雄瑞隆餐廳",
        "address": "806台灣高雄市前鎮區瑞隆路432號1樓",
        "rating": 3.9,
        "userRatingsTotal": 3230,
        "priceRange": null,
        "cuisine": [],
        "latitude": 22.6054811,
        "longitude": 120.3296335,
        "addedAt": "2025-07-12T13:20:13.489Z"
    },
    {
        "id": "cdf166c7-b36e-4b8b-8bab-9577ed743e01",
        "googlePlaceId": "ChIJMaim-2kFbjQRz4yV504Ve0s",
        "name": "麥當勞-高雄民族餐廳－設有得來速",
        "address": "813台灣高雄市左營區民族一路1026號",
        "rating": 3.9,
        "userRatingsTotal": 2817,
        "priceRange": null,
        "cuisine": [],
        "latitude": 22.6824131,
        "longitude": 120.3199997,
        "addedAt": "2025-07-12T12:18:37.769Z"
    },
    {
        "id": "c51a6549-e9d1-49fa-9877-51f2e9d2c441",
        "googlePlaceId": "ChIJ48SQOvAEbjQREpDmZOhQ11U",
        "name": "麥當勞-高雄天祥餐廳－設有得來速",
        "address": "807台灣高雄市三民區天祥一路150號",
        "rating": 3.9,
        "userRatingsTotal": 2245,
        "priceRange": null,
        "cuisine": [],
        "latitude": 22.6678956,
        "longitude": 120.3188243,
        "addedAt": "2025-07-12T12:12:58.811Z"
    }
]
```

**錯誤回應 (500 Internal Server Error)**
```json
{
	"message": "Failed to fetch watchlist.",
	"error": "..."
}
```

### 從口袋名單中刪除餐廳
* URL：`/api/watchlist/:restaurantId`
* Method：`DELETE`
* Description：從當前使用者的口袋名單中移除指定 ID 的餐廳。

**URL Parameters**

| 參數          |  說明                   |
|--------------|-------------------------|
| restaurantId | 要移除的餐廳的本地資料庫 ID |

**成功回應 (204 No Content)**: (No response body)

**錯誤回應 (404 Not Found)**
```json
{
	"message": "Restaurant not found in your watchlist."
}
```

**錯誤回應 (500 Internal Server Error)**
```json
{
	"message": "Failed to delete restaurant from watchlist.",
	"error": "..."
}
```
