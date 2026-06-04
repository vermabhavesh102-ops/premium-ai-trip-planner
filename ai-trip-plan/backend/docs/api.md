# API Documentation (summary)

Base path: `/api/`

Auth:
- `POST /api/auth/signup` — body: { full_name, email, password } → returns `{ access_token }` and sends verification email.
- `POST /api/auth/login` — form-encoded `username`(email) and `password` → returns `{ access_token }`.
- `GET /api/auth/me` — returns current user object (requires Authorization: Bearer <token>)
- `POST /api/auth/password-reset` — body: { email } → sends password reset email.
- `POST /api/auth/password-reset/confirm` — body: { uid, token, new_password } → set password.
- `GET /api/auth/verify-email/<uid>/<token>` — email verification link.

Trips:
- `POST /api/trips/generate` — body: { destination, duration_days, travelers, interests, budget } → returns generated itinerary (mock or AI)
- `GET /api/trips/` — list trips (supports `?search=`, `?ordering=`, pagination via `?page=`)
- `POST /api/trips/` — create trip (authenticated)
- `GET /api/trips/{id}/` — retrieve
- `PUT/PATCH /api/trips/{id}/` — update (owner or admin)
- `DELETE /api/trips/{id}/` — delete (owner or admin)
- `POST /api/trips/upload` — multipart `file` upload returns `{ url }` (for images)

Schema and docs:
- `GET /api/schema/` — OpenAPI JSON
- `GET /api/docs/` — simple docs page
