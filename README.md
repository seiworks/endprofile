# EndProfile

EndProfile 是一個本地開發中的人生規劃文件工具，提供登入、文件草稿填寫、草稿儲存、PDF 下載，以及本地版忘記密碼重設功能。

## Features

- 帳號註冊與登入
- 本地版忘記密碼：Email 對得上資料庫即可重設密碼，不寄送驗證信
- 五種文件 Wizard：
  - 預立遺囑
  - 授權書／同居協議
  - 共同購屋協議
  - 生活授權
  - 意定監護契約
- 文件草稿儲存與最近編輯時間
- PDF 下載
- 獨立每月貸款負擔試算（一般首購、新青安 3.0 逐年退場與雙方分攤），結果可套用至共同購屋協議
- `/api/ai/:documentType/generate` 本地範例假資料回傳

## Tech Stack

Frontend:

- Vue 3
- Vite
- Vue Router
- Vuex
- Bootstrap
- Vuetify
- Axios

Backend:

- Node.js
- Express
- MongoDB
- Mongoose 8
- JWT
- PDFKit

## Project Structure

```text
backend/
  models/
  routes/
  middleware/
  fonts/

frontend/
  src/components/pages/
  src/composables/
  src/constants/
  src/router/
  src/services/
  src/store/
```

## Local Setup

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd frontend
npm install
```

Start MongoDB locally before running the backend. The default MongoDB URI is:

```text
mongodb://localhost:27017/endprofile
```

Start backend:

```bash
cd backend
npm start
```

Run backend smoke check:

```bash
cd backend
npm run smoke
```

Start frontend:

```bash
cd frontend
npm run dev
```

Vite proxies frontend `/api` requests to:

```text
http://localhost:4000
```

## Environment Variables

Create `backend/.env` as needed.

```text
MONGODB_URI=mongodb://localhost:27017/endprofile
JWT_SECRET=<YOUR_LONG_RANDOM_SECRET>
PORT=4000
PDF_FONT_PATH=/absolute/path/to/backend/fonts/NotoSansTC-Regular.otf
```

Notes:

- `JWT_SECRET` is required in every environment. Keep it in `backend/.env` and never commit it.
- PDF generation uses `backend/fonts/NotoSansTC-Regular.otf` first. `PDF_FONT_PATH` is optional and only needed when overriding the bundled font.

## Main API Routes

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/reset-password`

User:

- `GET /api/users/me`

Documents:

- `GET /api/documents`
- `GET /api/documents/:id`
- `POST /api/documents`
- `PATCH /api/documents/:id`

EndProfile:

- `GET /api/endprofile`
- `PATCH /api/endprofile`

AI placeholder:

- `POST /api/ai/:documentType/generate`

Supported AI document types:

- `will`
- `cohabitation`
- `guardianship`
- `joint-purchase`
- `life-authorization`

PDF:

- `POST /api/pdf/document`

## Troubleshooting

If backend only prints a dotenv message and does not continue, check the installed Mongoose version:

```bash
cd backend
node -e "console.log(require('mongoose').version)"
```

This project currently uses Mongoose 8.x.

If backend prints `MongoDB connection error`, make sure MongoDB is running locally or set `MONGODB_URI` in `backend/.env`.

Use `node server.js` or `npm start` for backend startup. `npx node server.js` is not needed.

## Development Notes

- Follow `AGENTS.md` and the shared SEI rules in the parent `01_aiPJS` folder.
- Do not modify `.env` unless explicitly requested.
- Keep API contracts compatible with existing frontend usage.
- This project is currently local-first; the reset password flow is not suitable for production without email verification or reset tokens.
