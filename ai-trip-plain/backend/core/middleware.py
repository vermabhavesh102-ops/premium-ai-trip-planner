import logging
from trips.activity import log_activity
from trips.models import utcnow

logger = logging.getLogger(__name__)


class RequestLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        logger.info(f"{request.method} {request.get_full_path()}")
        response = self.get_response(request)
        self.track_request(request, response)
        return response

    def track_request(self, request, response):
        if request.path.startswith('/static/') or request.path.startswith('/media/'):
            return
        if request.path.startswith('/api/trips/activity'):
            return
        if not getattr(getattr(request, 'user', None), 'is_authenticated', False):
            return

        user = request.user
        try:
            user.last_active = utcnow()
            user.save()
        except Exception:
            pass

        action = 'page_visit' if request.method == 'GET' else 'api_request'
        itinerary_id = None
        resolver_match = getattr(request, 'resolver_match', None)
        if resolver_match:
            itinerary_id = resolver_match.kwargs.get('itinerary_id') or resolver_match.kwargs.get('pk')

        log_activity(
            request,
            action,
            itinerary_id=itinerary_id,
            page_visited=request.get_full_path(),
            status_code=getattr(response, 'status_code', None),
        )
