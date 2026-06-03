from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from django.conf import settings
from .models import User


class MongoJWTAuthentication(JWTAuthentication):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.user_id_claim = settings.SIMPLE_JWT.get('USER_ID_CLAIM', 'user_id')

    def get_user(self, validated_token):
        user_id = validated_token.get(self.user_id_claim)
        if user_id is None:
            raise AuthenticationFailed('Invalid token payload')
        try:
            user = User.objects.with_id(user_id)
        except Exception:
            raise AuthenticationFailed('User not found')
        if not getattr(user, 'is_active', True):
            raise AuthenticationFailed('User is disabled')
        return user
