from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.travel_guide import router as travel_guide_router
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

    # Django remains the source of truth for auth and MongoDB trip persistence.
    # This FastAPI service also exposes auth endpoints used by the frontend.
    app.include_router(travel_guide_router, prefix="/api/ai", tags=["travel-guide"])
    app.include_router(auth_router, prefix="/api/auth", tags=["auth"])


    @app.get("/api/health")
    async def health():
        return {"status": "ok"}

    return app


app = create_app()
