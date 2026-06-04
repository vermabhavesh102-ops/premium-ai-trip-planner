Trip Planner Django Backend

This backend implements a Django REST API using MongoDB (Djongo adapter).

Quick start (development):

1. Create virtualenv and install dependencies:

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. Copy `.env.example` to `.env` and adjust settings.

3. Run migrations and create superuser:

```bash
python manage.py migrate
python manage.py createsuperuser
```

4. Run development server:

```bash
python manage.py runserver
```

API endpoints (base `/api`):
- `POST /api/auth/signup` — create user
- `POST /api/auth/login` — obtain JWT (form-encoded username/password)
- `GET /api/auth/me` — current user
- `POST /api/trips/generate` — generate trip mock
- `GET/POST/PUT/DELETE /api/trips/` — CRUD saved trips

Extras:
- `POST /api/trips/upload` — upload file (returns `url`)
- API schema: `/api/schema/` (JSON)
- API docs (simple): `/api/docs/`

Deployment notes:
- Use Gunicorn + Daphne/ASGI for production if needed. Ensure `MONGODB_URI` is set in environment.
- Configure `EMAIL_BACKEND` and transactional email provider in production.

