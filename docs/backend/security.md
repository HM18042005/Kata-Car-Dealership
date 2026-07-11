# Backend Security

Passwords, JWTs, route dependencies, first-admin setup, CORS, and secrets.

## Passwords

Use bcrypt via `passlib`. Never log or return plaintext passwords or
`password_hash`. `security.py` exposes `hash_password(raw)` and
`verify_password(raw, hashed)`. Pin `bcrypt<4.1` with `passlib` 1.7.4, or
use `bcrypt.hashpw`/`checkpw` directly.

## JWT

Use HS256-signed JWTs with `SECRET_KEY` from the environment and a 60-minute
UTC expiry. Claims: `{ sub: user_id, role, exp }`. `security.py` exposes
`create_access_token(user)` and `decode_access_token(token)`. Role changes
apply after re-login.

## Dependencies

- **`require_user`** — reads the `Authorization: Bearer <jwt>` header,
  decodes it via `decode_access_token`. Missing header, malformed token,
  bad signature, or expired token all raise `401`. On success, returns the
  decoded claims (or the user id) to the route.
- **`require_admin`** — calls `require_user` first, then checks
  `role == "admin"` on the result. A `user`-role token raises `403`, not
  `401`.

Endpoint dependencies:

| Method | Path | Auth |
|---|---|---|
| POST | /api/auth/register | none |
| POST | /api/auth/login | none |
| POST | /api/vehicles | user |
| GET | /api/vehicles | user |
| GET | /api/vehicles/search | user |
| PUT | /api/vehicles/{id} | user |
| DELETE | /api/vehicles/{id} | admin |
| POST | /api/vehicles/{id}/purchase | user |
| POST | /api/vehicles/{id}/restock | admin |

`none`: no `Depends(...)`; `user`: `Depends(require_user)`; `admin`:
`Depends(require_admin)`.

## First admin

Run `python -m app.seed_admin` once with `ADMIN_EMAIL` and
`ADMIN_PASSWORD`. It is idempotent. Registration always creates
`role: "user"`; `seed_admin.py` is the only `role: "admin"` writer.

## CORS

Use an explicit `CORSMiddleware` origin allowlist:
`http://localhost:5173` plus the deployed SPA origin. Never use `*`.

## Secrets

Use a gitignored `.env` for `SECRET_KEY`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`,
and the Mongo connection string. Commit `.env.example`:

```
# .env.example
SECRET_KEY=change-me
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-me
MONGO_URI=mongodb://localhost:27017
```

## Not included

- Refresh tokens.
- Rate limiting.
- HTTP-only-cookie authentication.
