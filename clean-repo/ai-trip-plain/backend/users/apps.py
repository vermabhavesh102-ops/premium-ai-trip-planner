from django.apps import AppConfig
import logging

logger = logging.getLogger(__name__)


class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'users'

    def ready(self):
        try:
            from .models import User

            User.ensure_indexes()
        except Exception as exc:
            logger.warning("MongoDB user indexes were not created yet: %s", exc)
