from django.apps import AppConfig
import logging

logger = logging.getLogger(__name__)


class TripsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'trips'

    def ready(self):
        try:
            from .models import ActivityLog, Booking, Trip, Workspace

            for document in (Trip, Workspace, ActivityLog, Booking):
                document.ensure_indexes()
        except Exception as exc:
            logger.warning("MongoDB indexes were not created yet: %s", exc)
