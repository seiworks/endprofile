# EndProfile on Google Cloud Run

## Deployment choice

Cloud Run always runs a container, but you do not need to maintain a Dockerfile or install Docker locally. The repository root `package.json` provides the Buildpacks `gcp-build` and `start` scripts used by `gcloud run deploy --source .`. The checked-in `Dockerfile` is an optional reproducible fallback.

## Required services

- Cloud Run for the web application
- Secret Manager for application secrets
- MongoDB Atlas or another TLS-enabled MongoDB service reachable from Cloud Run
- Optional transactional email provider for notifications; password recovery itself uses the user's recovery key

## Runtime configuration

Set these non-secret environment variables:

```text
NODE_ENV=production
FRONTEND_ORIGIN=https://the-exact-cloud-run-or-custom-domain
```

Store these as Secret Manager-backed environment variables:

```text
MONGODB_URI
JWT_SECRET
REGISTRATION_INVITE_CODE
```

`JWT_SECRET` must contain at least 32 random bytes. The invitation code must contain at least 16 bytes and must be different from the JWT secret.

`PDF_FONT_PATH` is not required. Vite packages `frontend/public/fonts/NotoSansTC-Regular.otf`, and PDF generation runs in the browser.

## Build verification

Run the same build command locally or in CI:

```bash
npm run gcp-build
```

## Source deployment

Authenticate `gcloud`, select the project, enable Cloud Run, Cloud Build, Artifact Registry, and Secret Manager, then deploy:

```bash
gcloud run deploy endprofile \
  --source . \
  --region asia-east1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,FRONTEND_ORIGIN=https://YOUR_FINAL_ORIGIN \
  --set-secrets MONGODB_URI=MONGODB_URI:1,JWT_SECRET=JWT_SECRET:1,REGISTRATION_INVITE_CODE=REGISTRATION_INVITE_CODE:1
```

Pin each Secret Manager reference to the version you have created. When rotating a secret, add a new version and deliberately update the Cloud Run revision instead of silently following `latest`.

Use the final HTTPS Cloud Run URL or custom domain as `FRONTEND_ORIGIN`, with no trailing slash. If the URL is not known on the first deployment, deploy without traffic using a temporary valid HTTPS origin, obtain the generated service URL, then update `FRONTEND_ORIGIN` before routing users to the revision.

## Post-deployment checks

```bash
node scripts/verify-deployment.mjs https://YOUR_FINAL_ORIGIN
```

Then test with a dedicated invited account:

1. Register and download the recovery key.
2. Save and reload each document type.
3. Download and open a Chinese PDF.
4. Select “remember this device,” close the browser, and confirm the session restores.
5. Log out and confirm the old session cannot access a document.
6. Reset the password using the recovery key and confirm old sessions are revoked.

Never place `.env`, recovery keys, user passwords, or MongoDB credentials in source control, Cloud Build substitutions, issue comments, or deployment logs.
