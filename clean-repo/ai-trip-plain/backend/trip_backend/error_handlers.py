import logging
import traceback
from typing import Any, Optional

from django.http import HttpRequest, HttpResponse
from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_default_exception_handler
from rest_framework import status

logger = logging.getLogger(__name__)


USER_MESSAGES = {
    400: "Invalid request. Please try again.",
    401: "Please log in again.",
    403: "Access denied.",
    404: "Page not found.",
    429: "Too many requests. Please try later.",
    500: "Something went wrong. Please try again.",
}


def _friendly_message_for_code(code: int) -> str:
    return USER_MESSAGES.get(code, USER_MESSAGES[500])


def _render_error(request: HttpRequest, *, code: int) -> HttpResponse:
    # For HTML pages, keep content clean and user-friendly.
    context = {
        "status_code": code,
        "message": _friendly_message_for_code(code),
    }
    template_name = f"errors/{code}.html"
    try:
        return render(request, template_name, context=context, status=code)
    except Exception:
        # If template missing, fall back to 500 page.
        logger.exception("Error template render failed code=%s", code)
        return render(
            request,
            "errors/500.html",
            context={"status_code": 500, "message": _friendly_message_for_code(500)},
            status=500,
        )


def handler404(request: HttpRequest, exception: Exception) -> HttpResponse:
    # Do not leak exception.
    logger.info("404 Not Found path=%s", getattr(request, "path", ""))
    return _render_error(request, code=404)


def handler500(request: HttpRequest) -> HttpResponse:
    # Log full traceback internally.
    logger.error("500 Internal Server Error path=%s", getattr(request, "path", ""))
    logger.error("Traceback:\n%s", traceback.format_exc())
    return _render_error(request, code=500)


def drf_exception_handler(exc: Exception, context: Optional[dict[str, Any]] = None) -> Response:
    """DRF exception handler that ensures user-friendly responses.

    - Logs detailed traceback internally.
    - Returns only friendly messages in `detail`.
    """

    response = drf_default_exception_handler(exc, context)
    status_code = getattr(response, "status_code", None) if response is not None else None

    # Determine status code best-effort
    if status_code is None:
        # DRF typically has a `status_code` attribute on exceptions too.
        status_code = getattr(exc, "status_code", None) or status.HTTP_500_INTERNAL_SERVER_ERROR

    # Log detailed error internally
    try:
        view = context.get("view") if context else None
        logger.exception(
            "DRF error status=%s view=%s path=%s",
            status_code,
            type(view).__name__ if view else None,
            getattr(getattr(context.get("request"), "path", None) if context else None, "__str__", lambda: "")(),
        )
    except Exception:
        logger.exception("DRF error logging failed")

    return Response(
        {"detail": _friendly_message_for_code(int(status_code))},
        status=int(status_code),
    )

