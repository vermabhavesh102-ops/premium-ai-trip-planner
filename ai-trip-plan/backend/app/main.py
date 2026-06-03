from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.auth import router as auth_router


def create_app() -> FastAPI:
    app = FastAPI(
        title="AI Trip Plan Backend",
        version="0.1.0",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # NOTE: FastAPI auth was removed to avoid token incompatibility with Django SimpleJWT.
    # Django handles auth under: /api/auth/*
    # (users.urls is included in trip_backend/urls.py)
    # app.include_router(auth_router, prefix="/api/auth", tags=["auth"])


    @app.get("/api/health")
    async def health():
        return {"status": "ok"}

    return app


app = create_app()
