from django.contrib.auth.backends import BaseBackend
from .models import User


class MongoEngineBackend(BaseBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        email = kwargs.get('email') or username
        if email is None or password is None:
            return None
        user = User.objects(email=email).first()
        if user and user.check_password(password):
            return user
        return None

    def get_user(self, user_id):
        try:
            return User.objects.with_id(user_id)
        except Exception:
            return None
