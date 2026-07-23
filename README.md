# EndProfile

EndProfile 是一個人生規劃文件工具，提供邀請制帳號、零知識加密草稿、瀏覽器端 PDF 下載，以及使用者自持復原金鑰的密碼重設功能。

## Features

- 帳號註冊與登入
- 邀請碼註冊與 HttpOnly Cookie 登入
- 使用者自持復原金鑰的密碼重設（管理員無法代為解密或復原文件）
- 五種文件 Wizard：
  - 預立遺囑
  - 授權書／同居協議
  - 共同購屋協議
  - 生活授權
  - 意定監護契約
- 文件草稿儲存與最近編輯時間
- PDF 下載
- 獨立每月貸款負擔試算（一般首購、新青安 3.0 逐年退場與雙方分攤），結果可套用至共同購屋協議
- 文件內容在瀏覽器加密後才傳送到伺服器

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
- Web Crypto API / PDF-lib

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
http://localhost:4001
```

The local frontend runs at `http://localhost:5174` by default.

## Environment Variables

Create `backend/.env` as needed.

```text
MONGODB_URI=mongodb://localhost:27017/endprofile
JWT_SECRET=<YOUR_LONG_RANDOM_SECRET>
PORT=4001
FRONTEND_ORIGIN=https://your-frontend.example.com
REGISTRATION_INVITE_CODE=<YOUR_PRIVATE_INVITE_CODE>
```

Notes:

- `JWT_SECRET` is required in every environment. Keep it in `backend/.env` and never commit it.
- `REGISTRATION_INVITE_CODE` 未設定時不開放新帳號註冊。

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
- 復原金鑰只在建立保險庫時顯示；遺失密碼與復原金鑰後，任何人都無法解密文件。

## Friend-Only Production Deployment

Build and run the application as one same-origin service with the root `Dockerfile`. The reverse proxy or hosting platform must provide HTTPS.

```bash
docker build -t endprofile .
docker run --env-file backend/.env -p 4001:4001 endprofile
```

Required production environment variables:

- `NODE_ENV=production`
- `MONGODB_URI`: use a dedicated, least-privilege MongoDB user and TLS connection
- `JWT_SECRET`: at least 32 random bytes; never reuse the invite code
- `REGISTRATION_INVITE_CODE`: share privately only with invited friends
- `FRONTEND_ORIGIN`: exact public HTTPS origin, without a trailing slash
- `PORT`: the provided Docker and Render production configuration uses `4001`

Generate independent secrets, for example:

```bash
openssl rand -base64 48
```

Security properties:

- Document content is encrypted in the browser with AES-256-GCM before upload.
- The server stores only encrypted document envelopes and wrapped vault keys.
- Sessions use `HttpOnly`, `Secure`, `SameSite=Strict` cookies in production.
- Password reset and manual logout revoke all previously issued sessions for that account; authenticated API failures and 30 minutes of inactivity lock the browser vault.
- Password recovery requires the user's recovery key and an ECDSA challenge signature.
- PDF files are generated in the browser; plaintext document content is not sent to the PDF API.
- Production startup fails if secrets are missing, too short, reused, or still contain example placeholders.
- The HTTP service starts only after MongoDB connects, and `/api/health` reports database readiness.

Before inviting users, create encrypted MongoDB backups, test restoring one backup, and verify `/api/health` over HTTPS.

For Render, connect the repository as a Blueprint and use `render.yaml`. Set the three prompted values (`MONGODB_URI`, `REGISTRATION_INVITE_CODE`, and `FRONTEND_ORIGIN`) in Render's secret settings. `FRONTEND_ORIGIN` must be the final Render or custom-domain HTTPS URL.

After deployment, run the non-destructive production verification:

```bash
node scripts/verify-deployment.mjs https://your-endprofile-domain.example
```

Read [SECURITY.md](SECURITY.md) before sharing the invitation code. It documents visible metadata, user recovery responsibilities, backups, and the limits of zero-knowledge encryption.

## Google Cloud Run

Docker is optional. The root `package.json` supports Google Cloud Buildpacks, so Cloud Run can build directly from source:

```bash
gcloud run deploy endprofile \
  --source . \
  --region asia-east1 \
  --allow-unauthenticated
```

Set `NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`, `REGISTRATION_INVITE_CODE`, and the final HTTPS `FRONTEND_ORIGIN` through Cloud Run. Store secrets in Secret Manager instead of source code or `.env`. The existing `Dockerfile` remains available when deterministic container builds are preferred.

`PDF_FONT_PATH` is not used by the production application. PDF generation happens in the browser and the Chinese font is bundled at `frontend/public/fonts/NotoSansTC-Regular.otf`, which Vite copies into the production frontend.

Password recovery does not require email: the user proves possession of the recovery key in the browser. If email notifications or recovery-page links are added later, use a transactional email provider's HTTPS API from Cloud Run; the recovery key is still required to decrypt documents and must never be emailed or sent to an automation webhook.
