# EndProfile 正式版

EndProfile 正式版是只在個人電腦本機執行的人生規劃文件工具，提供本機帳號、五種文件 Wizard、MongoDB 草稿保存與瀏覽器端 PDF 下載。

## Features

- 本機帳號註冊與登入，不需要邀請碼
- 登入 Session 最長保留 7 天，沒有 30 分鐘閒置登出
- 本機忘記密碼功能：使用已註冊 Email 設定新密碼
- 五種文件 Wizard：預立遺囑、授權書／同居協議、共同購屋協議、生活授權、意定監護契約
- 文件表單、產生內文、狀態與最近編輯時間保存
- 切換文件或離開文件編輯頁面前，自動保存有變更的內容
- 閒置 30 分鐘後自動保存有變更的文件（不會自動登出）
- 瀏覽器端 PDF 下載
- 每月貸款負擔試算，支援 0–5 年寬限期、依貸款成數將自備款四捨五入至整數萬元並連動貸款總額、依帳號在瀏覽器本機保存所有試算欄位與尾差歸屬，並可將結果套用至共同購屋協議

文件的 `structuredData` 與 `draftText` 會以明文保存於本機 MongoDB。此設計只適合個人電腦，不可直接公開到網際網路。

## Tech Stack

Frontend: Vue 3、Vite、Vue Router、Vuex、Bootstrap、Vuetify、Axios、PDF-lib。

Backend: Node.js、Express、MongoDB、Mongoose 8、JWT。

## Local Setup

安裝依賴：

```bash
cd backend
npm install

cd ../frontend
npm install
```

先啟動本機 MongoDB，預設連線為：

```text
mongodb://localhost:27017/endprofile
```

啟動後端：

```bash
cd backend
npm start
```

啟動前端：

```bash
cd frontend
npm run dev
```

- 前端：`http://localhost:5174`
- 後端：`http://localhost:4001`
- Vite 將 `/api` 轉送到後端

## Environment Variables

`backend/.env`：

```text
MONGODB_URI=mongodb://localhost:27017/endprofile
JWT_SECRET=<至少 32 bytes 的隨機值>
PORT=4001
```

- `JWT_SECRET` 不可提交到 Git。
- 本機開發不需要設定 `FRONTEND_ORIGIN`。

## Main API Routes

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/reset-password`
- `POST /api/auth/logout`

User:

- `GET /api/users/me`

Documents:

- `GET /api/documents`
- `GET /api/documents/:id`
- `POST /api/documents`
- `PATCH /api/documents/:id`
- `POST /api/documents/:id/migrate`（僅供舊密文轉換並保留原編輯時間）

## Existing encrypted documents

舊版本以 AES-256-GCM 加密的文件仍保留相容欄位。使用者以原密碼登入時，瀏覽器會嘗試解密並轉存成明文 `structuredData`／`draftText`。轉換成功後會移除該文件的 `encryptedPayload`，並保留轉換前的 `updatedAt`。

如果舊密碼已遺失且沒有復原金鑰，舊密文在技術上無法還原；新建文件不受影響。

## Verification

```bash
npm run verify
```

包含後端 smoke test、安全整合測試、舊密文轉換測試、貸款試算測試及前端 production build。

## Security Notes

- 只綁定 localhost 使用，不要透過 port forwarding、公開 IP 或反向代理對外開放。
- MongoDB 必須只允許本機連線，不能公開 `27017`。
- Session cookie 為 `HttpOnly`、`SameSite=Strict`，最長 7 天；重設密碼與登出會撤銷既有 Session。
- 密碼以 bcrypt hash 保存，但文件內容與 MongoDB 備份是明文敏感資料。
- 建議啟用 FileVault／BitLocker，並妥善保管 MongoDB 備份與下載的 PDF。

詳見 [SECURITY.md](SECURITY.md)。

## Optimization proposal

系統現況、優化優先順序、實作拆分與驗收條件見 [系統優化規格](docs/system-optimization-spec.md)；內容為提案，尚未實作。
