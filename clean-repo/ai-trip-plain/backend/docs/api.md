# API Documentation (summary)

Base path: `/api/`

Auth:
- `POST /api/auth/signup` — body: { email, password } → returns `{ access_token }` and sends verification email.
- `POST /api/auth/login` — form-encoded `username`(email) and `password` → returns `{ access_token }`.
- `GET /api/auth/me` — returns current user object (requires Authorization: Bearer <token>)
- `GET /api/auth/profile` — profile details and saved-trip statistics
- `PATCH /api/auth/profile` — email is immutable; name fields are not stored
- `POST /api/auth/profile/image` — upload authenticated user's profile image
- `POST /api/auth/profile/password/send-otp` — email a short-lived password-change OTP
- `POST /api/auth/profile/password/verify-otp` — verify OTP and issue a short-lived change token
- `POST /api/auth/profile/password/change` — update password using the verified change token
- `POST /api/auth/forgot-password/send-otp` — generic forgot-password OTP request; does not reveal whether an email exists
- `POST /api/auth/forgot-password/verify-otp` — verify forgot-password OTP with attempt limits
- `POST /api/auth/forgot-password/change` — update forgotten password with a verified change token
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
