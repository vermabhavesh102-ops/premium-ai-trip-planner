from __future__ import annotations

from typing import Callable

from django.http import HttpRequest, HttpResponse


FORGOT_PASSWORD_PATH_PREFIXES = (
    '/api/auth/forgot-password/send-otp',
    '/api/auth/forgot-password/verify-otp',
    '/api/auth/forgot-password/change',
)


class ClickjackingHeaderBypassMiddleware:
    """
    For specific forgot-password OTP endpoints, we avoid X-Frame-Options restrictions.
    This prevents browser-side clickjacking blocks that can surface as an exception/500
    in embedded contexts.

    NOTE: Keep this narrow and endpoint-specific.
    """

    def __init__(self, get_response: Callable[[HttpRequest], HttpResponse]):
        self.get_response = get_response

    def __call__(self, request: HttpRequest) -> HttpResponse:
        response = self.get_response(request)

        path = request.path or ''
        if any(path.startswith(p) for p in FORGOT_PASSWORD_PATH_PREFIXES):
            # Allow same-origin framing only; still prevents other sites.
            response['X-Frame-Options'] = 'SAMEORIGIN'
            # Modern alternative
            response['Content-Security-Policy'] = (
                response.get('Content-Security-Policy', '') +
                ('; ' if response.get('Content-Security-Policy') else '') +
                "frame-ancestors 'self'"
            )

        return response

