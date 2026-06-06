from typing import Any

from .models import ActivityLog, utcnow


def get_ip_address(request):
    forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if forwarded_for:
        return forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR', '')


def get_user_agent(request):
    return request.META.get('HTTP_USER_AGENT', '')


def get_user_identity(request):
    user = getattr(request, 'user', None)
    if not user or not getattr(user, 'is_authenticated', False):
        return None, None
    return str(getattr(user, 'id', '')), getattr(user, 'email', None)


def log_activity(
    request,
    action: str,
    *,
    itinerary_id: str | None = None,
    page_visited: str | None = None,
    click_event: str | None = None,
    status_code: int | None = None,
    login_time=None,
    logout_time=None,
    metadata: dict[str, Any] | None = None,
):
    user_id, user_email = get_user_identity(request)
    now = utcnow()

    try:
        ActivityLog(
            user_id=user_id,
            user_email=user_email,
            itinerary_id=itinerary_id,
            action=action,
            page_visited=page_visited or getattr(request, 'path', ''),
            click_event=click_event,
            method=getattr(request, 'method', ''),
            path=getattr(request, 'path', ''),
            status_code=status_code,
            login_time=login_time,
            logout_time=logout_time,
            last_active_time=now,
            device_info=get_user_agent(request),
            browser_info=get_user_agent(request),
            ip_address=get_ip_address(request),
            metadata=metadata or {},
        ).save()
    except Exception:
        # Activity tracking should never break the user-facing request.
        return None
