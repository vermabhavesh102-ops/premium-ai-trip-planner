# TODO - JWT Auth Fix (login/signup)

- [ ] Fix frontend endpoints to hit Django routes:
  - [x] Login: /api/auth/login
  - [x] Signup: /api/auth/signup
  - [x] AuthContext: /api/auth/me
- [ ] Implement refresh-token flow in frontend:
  - [ ] Store refresh_token from backend
  - [ ] Add /api/auth/refresh/ call when access token invalid/expired
  - [ ] Retry /api/auth/me after refresh
- [ ] Verify backend returns JSON (no DOCTYPE/HTML):

  - [ ] Run backend test_auth.py
  - [ ] Smoke test login/signup and protected /me
- [ ] Produce final verification report + audit report.

