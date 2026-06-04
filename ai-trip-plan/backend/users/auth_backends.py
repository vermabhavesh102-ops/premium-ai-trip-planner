from django.contrib.auth.backends import BaseBackend
from .models import User


class MongoEngineBackend(BaseBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None:
            username = kwargs.get('email')
        if username is None or password is None:
            return None
        user = User.objects(email=username).first() or User.objects(username=username).first()
        if user and user.check_password(password):
            return user
        return None

    def get_user(self, user_id):
        try:
            return User.objects.with_id(user_id)
        except Exception:
            return None
