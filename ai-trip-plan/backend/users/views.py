from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import User
from .serializers import SignupSerializer, UserSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.utils import timezone
from django.urls import reverse
from django.core.mail import send_mail
from django.conf import settings
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator
from trips.activity import log_activity
from trips.models import utcnow


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def signup(request):
    serializer = SignupSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    try:
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(str(user.id)))
        verify_path = reverse('verify_email', args=[uid, token])
        verify_url = f"{request.scheme}://{request.get_host()}{verify_path}"
        send_mail(
            subject='Verify your email',
            message=f'Click to verify: {verify_url}',
            from_email=settings.EMAIL_HOST_USER or 'noreply@example.com',
            recipient_list=[user.email],
        )
    except Exception:
        pass
    refresh = RefreshToken.for_user(user)
    return Response({'access_token': str(refresh.access_token), 'refresh_token': str(refresh)}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def me(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def password_reset_request(request):
    email = request.data.get('email')
    if not email:
        return Response({'detail': 'Email required'}, status=status.HTTP_400_BAD_REQUEST)
    user = User.objects(email=email).first()
    if user:
        try:
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(str(user.id)))
            reset_url = f"{request.scheme}://{request.get_host()}/reset-password?uid={uid}&token={token}"
            send_mail(
                subject='Reset your password',
                message=f'Click to reset your password: {reset_url}',
                from_email=settings.EMAIL_HOST_USER or 'noreply@example.com',
                recipient_list=[user.email],
            )
        except Exception:
            pass
    return Response({}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def verify_email(request, uidb64, token):
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(id=uid)
    except Exception:
        return Response({'detail': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)
    if default_token_generator.check_token(user, token):
        user.is_email_verified = True
        user.email_verified_at = timezone.now()
        user.save()
        return Response({'detail': 'Email verified'})
    return Response({'detail': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def password_reset_confirm(request):
    uidb64 = request.data.get('uid')
    token = request.data.get('token')
    new_password = request.data.get('new_password')
    if not uidb64 or not token or not new_password:
        return Response({'detail': 'Missing fields'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(id=uid)
    except Exception:
        return Response({'detail': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)
    if default_token_generator.check_token(user, token):
        user.set_password(new_password)
        user.save()
        return Response({'detail': 'Password set'})
    return Response({'detail': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    username = request.data.get('username') or request.POST.get('username')
    password = request.data.get('password') or request.POST.get('password')
    if username is None or password is None:
        return Response({'detail': 'username and password required'}, status=status.HTTP_400_BAD_REQUEST)
    user = authenticate(request, username=username, password=password)
    if user is None:
        return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    now = utcnow()
    user.last_login = now
    user.last_active = now
    user.save()
    refresh = RefreshToken.for_user(user)
    request.user = user
    log_activity(request, 'login', login_time=now, status_code=200)
    return Response({'access_token': str(refresh.access_token), 'refresh_token': str(refresh)})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    now = utcnow()
    user = request.user
    user.last_logout = now
    user.last_active = now
    user.save()
    log_activity(request, 'logout', logout_time=now, status_code=200)
    return Response({'detail': 'Logged out'})
