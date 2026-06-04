from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
import logging
import traceback
 
from app.api.routes.auth import router as auth_router
 
LOG = logging.getLogger("ai-trip-plan")
LOG.setLevel(logging.INFO)
 
def _friendly_message_for_status(status_code: int, detail: str | None = None) -> str:
    if status_code == 400:
        return "Please check the information you entered."
    if status_code == 401:
        return "Invalid email or password."
    if status_code == 403:
        return "You do not have permission to perform this action."
    if status_code == 404:
        return "Requested resource could not be found."
    if status_code == 409:
        # preserve specific message if provided
        return detail or "An account with this email already exists."
    return "Something went wrong on our side. Please try again later."
 
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
 
    # Structured validation error handler (returns friendly per-field messages)
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        LOG.info("Validation error for request %s: %s", request.url.path, exc.errors())
        field_errors: dict = {}
        for err in exc.errors():
            # err example: {'loc': ('body', 'email'), 'msg': 'value is not a valid email', ...}
            loc = err.get("loc", [])
            if len(loc) >= 2 and loc[0] in ("body",):
                field = loc[-1]
            else:
                field = ".".join(str(p) for p in loc)
            field_errors.setdefault(field, []).append(err.get("msg"))
        # Simplify lists to strings
        field_errors_simple = {k: "; ".join(v) for k, v in field_errors.items()}
        return JSONResponse(
            status_code=400,
            content={
                "status": "error",
                "message": "Please check the information you entered.",
                "errors": field_errors_simple,
            },
        )
 
    # HTTPException handler to return friendly messages without leaking internals
    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        LOG.info("HTTPException for %s: %s %s", request.url.path, exc.status_code, exc.detail)
        friendly = _friendly_message_for_status(exc.status_code, detail=str(exc.detail) if exc.detail else None)
        # For some client flows we still want structured details (eg. 409 for duplicate email)
        content = {"status": "error", "message": friendly}
        if exc.status_code == 409:
            # include a short code to help frontend decide to show duplicate modal
            content["code"] = "email_exists"
        return JSONResponse(status_code=exc.status_code, content=content)
 
    # Fallback exception handler - logs full traceback, returns generic message
    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception):
        LOG.exception("Unhandled exception for %s: %s", request.url.path, traceback.format_exc())
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": "Something went wrong on our side. Please try again later."},
        )
 
    @app.get("/api/health")
    async def health():
        return {"status": "ok"}
 
    return app
 
 
app = create_app()
