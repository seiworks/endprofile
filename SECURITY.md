# EndProfile Security Model

## What the server can see

The server can see account email, display name, document type/title/status, update timestamps, and encrypted payload sizes. It stores document bodies only as AES-256-GCM ciphertext. This metadata is not zero-knowledge and should not contain private document details.

## What the server cannot recover

The document vault key exists in browser memory while the user is signed in. The password-derived key and recovery secret only wrap that vault key. The server stores wrapped keys and a recovery public key, but it does not receive the vault key, password-derived key, recovery secret, recovery private key, or plaintext PDF content.

There is intentionally no administrator recovery path. If a user loses both the password and recovery key, the encrypted documents cannot be recovered.

## User responsibilities

- Save the recovery key immediately and keep it separately from the password.
- Do not send the recovery key through the same chat or email used to share the invitation code.
- Use a unique password of at least 12 characters.
- “Remember this device” stores the non-extractable browser `CryptoKey` in IndexedDB for up to seven days. Enable it only on a personally controlled device; it intentionally disables the 30-minute idle lock for that remembered session.
- Log out on shared devices. The app automatically locks after 30 minutes without interaction; closing or refreshing the tab also removes the in-memory vault key and requires another login.
- Treat a downloaded PDF as plaintext and protect or delete it appropriately.

## Operator responsibilities

- Serve the app only from one HTTPS origin and set `FRONTEND_ORIGIN` to that exact origin.
- Keep MongoDB private, require TLS, use a least-privilege database account, and restrict network access to the application host.
- Keep `JWT_SECRET` and `REGISTRATION_INVITE_CODE` in the hosting platform's secret store, never Git.
- Rotate the invitation code if it is disclosed. Rotating it does not affect existing users.
- Password reset and logout increment the account session version, immediately invalidating previously issued JWT cookies.
- Back up MongoDB using provider-side encryption and test restoration. Backups contain ciphertext but remain operationally sensitive.
- Password recovery challenges are single-use MongoDB records with a five-minute TTL, so recovery remains consistent across multiple application instances.
- Review dependency and CI alerts before deploying changes.

## Scope and limitations

Browser-side encryption protects stored document content from the database operator, backups, and accidental server-side logging. It does not protect a user whose browser/device is compromised, a malicious browser extension, plaintext PDFs after download, traffic metadata, or a maliciously modified frontend served by an operator. Changes to cryptography, authentication, PDF generation, or HTML injection handling require a security review.

Report a suspected vulnerability privately to the repository owner. Do not include real recovery keys, passwords, document plaintext, or production database credentials in an issue.
