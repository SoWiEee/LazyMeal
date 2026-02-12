# LazyMeal 安全性檢視與 AWS/Cloudflare 部署強化建議

本文件根據目前程式碼與部署設定（FastAPI + Vue + PostgreSQL + Redis + Docker Compose）進行安全面向盤點，並針對未來部署到 AWS EC2、搭配 Cloudflare WAF / 憑證與 Nginx 負載平衡的情境提出可落地改善方案。

## 一、目前專案主要風險（依優先級）

## 1) 沒有任何驗證/授權，且使用固定使用者 ID

- 目前 watchlist 服務使用固定 `DEFAULT_USER_ID = "1337"`，所有請求都會操作同一個使用者資料。這代表沒有身份分離，任何人都能新增/刪除同一份清單。  
- 風險：資料越權、資料汙染、無法稽核使用者行為。

建議：
- 導入身份驗證（建議 JWT + refresh token，或接 Cloudflare Access / OIDC）。
- 在 API 層從 token 解析 `sub/user_id`，完全移除固定 user fallback。
- 對每個修改類 API 記錄 `request_id` 與 `user_id` 以利 audit。

## 2) 關鍵資料寫入 API 缺乏存取控制

- `PUT /api/restaurants/{restaurant_id}` 與 `DELETE /api/restaurants/{restaurant_id}` 目前沒有管理者權限檢查。
- 風險：任意匿名使用者可修改或刪除餐廳資料。

建議：
- 若是公開 API，至少將寫入 API 改為內網或管理端專用。
- 以角色式授權（RBAC）限制 admin 才可執行更新/刪除。
- 在 Cloudflare WAF/Zero Trust 上額外限制管理路徑（IP allowlist / 身份保護）。

## 3) 缺乏請求速率限制與濫用防護

- `/api/watchlist/search-google` 可被大量呼叫，會直接觸發對 Google Places 的外部請求。
- 風險：API 金鑰成本暴增、服務降級、被惡意刷流量。

建議：
- 應用層加上 rate limiting（如 `slowapi` 或 Redis token bucket），至少對匿名端點限制 QPS。
- Cloudflare WAF 套用 rate limit rule，針對可疑 IP / ASN / 國家封鎖。
- 為 Google Places 查詢增加短 TTL cache 與重複查詢抑制。

## 4) 輸入驗證規則偏寬鬆

- Query/body 參數缺乏嚴格界限（例如 query 長度、lat/lon 合理範圍等）。
- 風險：資源耗盡、異常輸入導致不必要的錯誤或探測面。

建議：
- 在 Pydantic schema 增加約束：
  - `query`: min/max length。
  - `lat`: `-90~90`，`lon`: `-180~180`。
  - `radiusKm`: 上限（如 50km）。
- 針對 path 參數（如 `google_place_id`）設定 pattern 與長度限制。

## 5) Docker Compose 預設密碼與不必要對外暴露

- `docker-compose.yml` 內 DB 帳密示範值固定且弱（`lazymeal/lazymeal`），並直接暴露 PostgreSQL 與 Redis port。
- 風險：在誤用到 staging/production 時，容易被掃描與入侵。

建議：
- production 不要公開 `5432` 與 `6379` 到公網。
- DB/Redis 只允許私網存取（Security Group + NACL）。
- 強密碼改由 AWS Secrets Manager / SSM Parameter Store 注入。

## 6) 缺少安全 HTTP 標頭與傳輸層策略

- 目前應用層未設置 HSTS、CSP、X-Frame-Options、X-Content-Type-Options 等。
- 風險：提升瀏覽器端攻擊成功率（Clickjacking、MIME sniffing 等）。

建議：
- 在 Nginx 層統一加上 security headers。
- 強制 HTTPS（Cloudflare Full strict + origin cert）。
- 關閉不必要 response headers（例如 server tokens）。

## 7) 容器執行身分與映像加固可再提升

- 後端/前端 Dockerfile 未顯示切換為 non-root user。
- 風險：容器逃逸後影響面更大。

建議：
- 以 non-root user 執行程序。
- 使用最小權限檔案系統（唯讀 rootfs、drop capabilities、seccomp profile）。
- 導入映像掃描（Trivy/Grype）與依賴弱點掃描（pip-audit / npm audit）。

## 二、AWS EC2 + Cloudflare + Nginx 建議架構

## 1) 網路與入口分層

- Cloudflare 作為唯一公開入口（DNS proxied）。
- EC2 Security Group 僅允許：
  - 443 from Cloudflare IP ranges
  - 22 僅限管理 IP（或改用 SSM Session Manager 關閉 SSH）
- Nginx 對外 443，後端服務走 localhost/private network。

## 2) TLS 與憑證

- Cloudflare SSL 模式使用 **Full (strict)**。
- origin 使用 Cloudflare Origin Certificate。
- Nginx 開啟 TLS1.2+、關閉弱 cipher、啟用 OCSP stapling。

## 3) Nginx 反向代理安全設定（重點）

- 加入：
  - `Strict-Transport-Security`
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - 合理 `Content-Security-Policy`（依前端資源調整）
- `client_max_body_size` 設定合理上限。
- upstream timeout / keepalive 設定避免慢連線耗盡。
- 只開放必要路徑；管理 API 可額外 Basic Auth 或 Cloudflare Access。

## 4) 日誌、監控與告警

- FastAPI access log + app log 結構化（JSON），加入 request id。
- Nginx / app logs 匯入 CloudWatch。
- 建立告警：5xx 異常升高、流量突增、單 IP 攻擊行為。
- 啟用 Cloudflare WAF managed rules + bot management。

## 三、建議優先實作清單（30/60/90 天）

## 0~30 天（高優先）

1. 導入使用者驗證，移除固定 user id。
2. 關閉公開 DB/Redis port，改私網。
3. 寫入 API 增加 RBAC。
4. 對 search-google 加速率限制。
5. 改用 Secrets Manager/SSM 管理敏感變數。

## 31~60 天

1. 加入 schema 級別輸入約束（lat/lon/query/radius）。
2. Nginx 補齊安全標頭 + TLS hardening。
3. 建立 CloudWatch + WAF 告警儀表板。
4. 建立備份與還原演練（RPO/RTO 驗證）。

## 61~90 天

1. 加入安全測試流程（SAST + dependency scan + container scan）。
2. 建立 DAST / API security 測試腳本（如 OWASP ZAP baseline）。
3. 風險導向稽核：登入、權限、敏感 API 行為記錄。

## 四、可新增的安全測試腳本建議

- `scripts/security/test_rate_limit.sh`: 驗證單 IP 連續呼叫是否被限流。
- `scripts/security/test_authz.sh`: 驗證未授權角色無法呼叫寫入 API。
- `scripts/security/test_headers.sh`: 檢查 HSTS/CSP/XFO/nosniff。
- `scripts/security/test_input_validation.sh`: fuzz lat/lon/query/radius 邊界。
- CI 新增：
  - Python: `pip-audit`, `bandit`
  - Frontend: `npm audit`（或 bun 對應機制）
  - Image: `trivy image`

---

若你希望，我可以下一步直接幫你產出：
1) 一份可直接套用的 Nginx 安全範本（含 Cloudflare real IP、headers、rate limit），
2) FastAPI 的 JWT + RBAC 最小實作骨架，
3) 上述 security 測試腳本初版與 GitHub Actions 工作流。
