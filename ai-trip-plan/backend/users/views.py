import datetime
import os
import secrets
import uuid

from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.parsers import MultiPartParser
from rest_framework.decorators import parser_classes
from rest_framework.response import Response
from .models import PasswordOtpLog, User
from .serializers import ProfileUpdateSerializer, SignupSerializer, UserSerializer
from rest_framework_simplejwt.tokens import RefreshToken
import logging

logger = logging.getLogger(__name__)

from django.contrib.auth import authenticate
from django.contrib.auth.hashers import check_password, make_password
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.urls import reverse
from django.core.mail import send_mail
from django.conf import settings
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator
from trips.activity import log_activity
from trips.models import Trip, utcnow
from .email_utils import send_otp_email, smtp_config_summary



OTP_EXPIRY_MINUTES = 10
CHANGE_TOKEN_EXPIRY_MINUTES = 10
MAX_OTP_ATTEMPTS = 5
OTP_RESEND_SECONDS = 60
OTP_DAILY_LIMIT = 999999

OTP_IP_HOURLY_LIMIT = 20
PROFILE_IMAGE_MAX_BYTES = 5 * 1024 * 1024
PROFILE_IMAGE_TYPES = {'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp'}
GENERIC_FORGOT_PASSWORD_RESPONSE = {
    'detail': 'If that email is registered, an OTP has been sent. Please check your inbox and spam folder.'
}


def normalized_email(value):
    return str(value or '').strip().lower()


def client_ip(request):
    forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if forwarded_for:
        return forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR', '')


def log_otp_event(request, *, email, purpose, status_value, user=None, metadata=None):
    try:
        PasswordOtpLog(
            email=normalized_email(email),
            user_id=str(user.id) if user else '',
            purpose=purpose,
            status=status_value,
            ip_address=client_ip(request),
            metadata=metadata or {},
        ).save()
    except Exception:
        logger.exception('Could not write OTP audit log email=%s purpose=%s status=%s', email, purpose, status_value)


def recent_otp_count(email, purpose, hours=24):
    since = utcnow() - datetime.timedelta(hours=hours)
    return PasswordOtpLog.objects(
        email=normalized_email(email),
        purpose=purpose,
        status__in=['sent', 'failed_send'],
        created_at__gte=since,
    ).count()


def latest_otp_log(email, purpose):
    return PasswordOtpLog.objects(email=normalized_email(email), purpose=purpose).order_by('-created_at').first()


def recent_otp_ip_count(ip_address, purpose, hours=1):
    if not ip_address:
        return 0
    since = utcnow() - datetime.timedelta(hours=hours)
    return PasswordOtpLog.objects(
        ip_address=ip_address,
        purpose=purpose,
        status__in=['requested', 'sent', 'failed_send'],
        created_at__gte=since,
    ).count()


def otp_request_block_reason(email, purpose, ip_address=''):
    latest = latest_otp_log(email, purpose)
    if latest and latest.created_at > utcnow() - datetime.timedelta(seconds=OTP_RESEND_SECONDS):
        return f'Please wait {OTP_RESEND_SECONDS} seconds before requesting another OTP.'
    if recent_otp_count(email, purpose) >= OTP_DAILY_LIMIT:
        return 'OTP request limit reached. Please try again after 24 hours.'
    if recent_otp_ip_count(ip_address, purpose) >= OTP_IP_HOURLY_LIMIT:
        return 'Too many OTP requests from this network. Please try again later.'
    return ''


def prepare_user_otp(user):
    otp = f'{secrets.randbelow(1_000_000):06d}'
    user.password_otp_hash = make_password(otp)
    user.password_otp_expires_at = utcnow() + datetime.timedelta(minutes=OTP_EXPIRY_MINUTES)
    user.password_otp_sent_at = utcnow()
    user.password_otp_attempts = 0
    user.password_change_token_hash = ''
    user.password_change_token_expires_at = None
    user.save()
    return otp


def profile_payload(user):
    trips = list(Trip.objects(owner_id=str(user.id), is_deleted=False))
    destinations = {trip.destination.strip().lower() for trip in trips if trip.destination}
    data = UserSerializer(user).data
    data['stats'] = {
        'saved_trips': len(trips),
        'destinations': len(destinations),
        'days_planned': sum(trip.duration_days or 0 for trip in trips),
    }
    return data


def validate_new_password(password, user):
    # Django's built-in password validators expect a Django model instance.
    # Your auth/user object is not compatible with validator attribute introspection
    # (e.g. MetaDict doesn't have get_field), causing a server 500.
    # So we only apply lightweight custom checks here.
    try:
        validate_password(password, user=user)
    except Exception:
        # Fallback to custom checks below.
        pass


    if not any(char.isupper() for char in password):
        return ['Password must contain an uppercase letter.']
    if not any(char.islower() for char in password):
        return ['Password must contain a lowercase letter.']
    if not any(char.isdigit() for char in password):
        return ['Password must contain a number.']
    if password.isalnum():
        return ['Password must contain a special character.']
    return []


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


@api_view(['GET', 'PATCH'])
@permission_classes([permissions.IsAuthenticated])
def profile(request):
    if request.method == 'GET':
        return Response(profile_payload(request.user))

    serializer = ProfileUpdateSerializer(
        request.user,
        data=request.data,
        partial=True,
        context={'user': request.user},
    )
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    return Response(profile_payload(user))


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
@parser_classes([MultiPartParser])
def upload_profile_image(request):
    image = request.FILES.get('image')
    if not image:
        return Response({'detail': 'Profile image is required.'}, status=status.HTTP_400_BAD_REQUEST)
    if image.size > PROFILE_IMAGE_MAX_BYTES:
        return Response({'detail': 'Profile image must be 5 MB or smaller.'}, status=status.HTTP_400_BAD_REQUEST)

    extension = PROFILE_IMAGE_TYPES.get(getattr(image, 'content_type', ''))
    if not extension:
        return Response({'detail': 'Only JPG, PNG, and WebP images are allowed.'}, status=status.HTTP_400_BAD_REQUEST)

    relative_dir = os.path.join('profile-images', str(request.user.id))
    absolute_dir = os.path.join(settings.MEDIA_ROOT, relative_dir)
    os.makedirs(absolute_dir, exist_ok=True)
    filename = f'{uuid.uuid4().hex}{extension}'
    absolute_path = os.path.join(absolute_dir, filename)
    with open(absolute_path, 'wb') as destination:
        for chunk in image.chunks():
            destination.write(chunk)

    relative_url = f"{settings.MEDIA_URL.rstrip('/')}/{relative_dir.replace(os.sep, '/')}/{filename}"
    request.user.profile_image = request.build_absolute_uri(relative_url)
    request.user.save()
    return Response(profile_payload(request.user))


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def send_password_otp(request):
    email = normalized_email(request.user.email)
    purpose = 'profile_change'
    block_reason = otp_request_block_reason(email, purpose, client_ip(request))
    if block_reason:
        log_otp_event(request, email=email, purpose=purpose, status_value='blocked', user=request.user, metadata={'reason': block_reason})
        return Response(
            {'detail': block_reason},
            status=status.HTTP_429_TOO_MANY_REQUESTS,
        )

    log_otp_event(request, email=email, purpose=purpose, status_value='requested', user=request.user)
    otp = prepare_user_otp(request.user)

    try:
        logger.info(

            'OTP generated user_id=%s email=%s expires_at=%s smtp=%s',
            str(getattr(request.user, 'id', 'unknown')),
            request.user.email,
            str(request.user.password_otp_expires_at),
            smtp_config_summary(),
        )

        message_id = send_otp_email(

            recipient=email,
            otp=otp,
            user_id=str(request.user.id),
            expires_minutes=OTP_EXPIRY_MINUTES,
        )
        log_otp_event(request, email=email, purpose=purpose, status_value='sent', user=request.user, metadata={'message_id': message_id})
        logger.info('OTP email queued user_id=%s email=%s message_id=%s', str(request.user.id), request.user.email, message_id)
    except Exception as e:
        logger.exception(
            'OTP email delivery failed user_id=%s email=%s error=%s',
            str(getattr(request.user, 'id', 'unknown')),
            request.user.email,
            str(e),
        )
        request.user.password_otp_hash = ''
        request.user.password_otp_expires_at = None
        request.user.password_otp_sent_at = None
        request.user.save()
        log_otp_event(request, email=email, purpose=purpose, status_value='failed_send', user=request.user, metadata={'error': str(e)})
        return Response(
            {
                'detail': 'OTP email could not be sent. Please check SMTP configuration or try again later.',
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )
    return Response({'detail': 'OTP sent to your registered email address.'})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def verify_password_otp(request):
    otp = str(request.data.get('otp', '')).strip()
    user = request.user
    if not otp:
        return Response({'detail': 'OTP is required.'}, status=status.HTTP_400_BAD_REQUEST)
    if not user.password_otp_hash or not user.password_otp_expires_at or user.password_otp_expires_at < utcnow():
        return Response({'detail': 'OTP has expired. Request a new OTP.'}, status=status.HTTP_400_BAD_REQUEST)
    if user.password_otp_attempts >= MAX_OTP_ATTEMPTS:
        log_otp_event(request, email=user.email, purpose='profile_change', status_value='locked', user=user)
        return Response({'detail': 'Too many invalid attempts. Request a new OTP.'}, status=status.HTTP_429_TOO_MANY_REQUESTS)
    if not check_password(otp, user.password_otp_hash):
        user.password_otp_attempts += 1
        user.save()
        log_otp_event(request, email=user.email, purpose='profile_change', status_value='invalid_otp', user=user, metadata={'attempts': user.password_otp_attempts})
        return Response({'detail': 'Invalid OTP.'}, status=status.HTTP_400_BAD_REQUEST)

    change_token = secrets.token_urlsafe(32)
    user.password_otp_hash = ''
    user.password_otp_expires_at = None
    user.password_otp_sent_at = None
    user.password_otp_attempts = 0
    user.password_change_token_hash = make_password(change_token)
    user.password_change_token_expires_at = utcnow() + datetime.timedelta(minutes=CHANGE_TOKEN_EXPIRY_MINUTES)
    user.save()
    log_otp_event(request, email=user.email, purpose='profile_change', status_value='verified', user=user)
    return Response({'verification_token': change_token, 'detail': 'OTP verified.'})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password(request):
    token = str(request.data.get('verification_token', ''))
    password = str(request.data.get('new_password', ''))
    confirm_password = str(request.data.get('confirm_password', ''))
    user = request.user

    if password != confirm_password:
        return Response({'detail': 'Passwords do not match.'}, status=status.HTTP_400_BAD_REQUEST)
    if (
        not token
        or not user.password_change_token_hash
        or not user.password_change_token_expires_at
        or user.password_change_token_expires_at < utcnow()
        or not check_password(token, user.password_change_token_hash)
    ):
        return Response({'detail': 'Password verification has expired. Verify a new OTP.'}, status=status.HTTP_400_BAD_REQUEST)

    password_errors = validate_new_password(password, user)
    if password_errors:
        return Response({'detail': password_errors}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(password)
    user.password_change_token_hash = ''
    user.password_change_token_expires_at = None
    user.save()
    log_otp_event(request, email=user.email, purpose='profile_change', status_value='password_updated', user=user)
    return Response({'detail': 'Password Updated Successfully'})


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def forgot_password_send_otp(request):
    email = normalized_email(request.data.get('email') or request.POST.get('email'))

    if not email:
        return Response(GENERIC_FORGOT_PASSWORD_RESPONSE)

    purpose = 'forgot_password'
    user = User.objects(email=email).first()
    block_reason = otp_request_block_reason(email, purpose, client_ip(request))
    if block_reason:
        log_otp_event(
            request,
            email=email,
            purpose=purpose,
            status_value='blocked',
            user=user,
            metadata={'reason': block_reason},
        )
        print(f"[OTP DEBUG] forgot-password blocked email={email} reason={block_reason}")
        return Response(GENERIC_FORGOT_PASSWORD_RESPONSE)

    log_otp_event(
        request,
        email=email,
        purpose=purpose,
        status_value='requested',
        user=user,
        metadata={'user_exists': bool(user)},
    )
    if not user:
        print(f"[OTP DEBUG] forgot-password user not found email={email}")
        return Response(GENERIC_FORGOT_PASSWORD_RESPONSE)

    otp = prepare_user_otp(user)
    try:
        print(
            "[OTP DEBUG] forgot-password sending email="
            f"{email} user_id={str(user.id)} expires_at={str(getattr(user, 'password_otp_expires_at', None))}"
        )
        print(f"[OTP DEBUG] smtp_config_summary={smtp_config_summary()}")

        message_id = send_otp_email(
            recipient=email,
            otp=otp,
            user_id=str(user.id),
            expires_minutes=OTP_EXPIRY_MINUTES,
        )
        log_otp_event(
            request,
            email=email,
            purpose=purpose,
            status_value='sent',
            user=user,
            metadata={'message_id': message_id},
        )
        print(f"[OTP DEBUG] forgot-password sent message_id={message_id}")
    except Exception as exc:
        print(f"[OTP DEBUG] forgot-password send failed error={exc}")
        user.password_otp_hash = ''
        user.password_otp_expires_at = None
        user.password_otp_sent_at = None
        user.save()
        log_otp_event(
            request,
            email=email,
            purpose=purpose,
            status_value='failed_send',
            user=user,
            metadata={'error': str(exc)},
        )

    return Response(GENERIC_FORGOT_PASSWORD_RESPONSE)



@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def forgot_password_verify_otp(request):
    email = normalized_email(request.data.get('email'))
    otp = str(request.data.get('otp', '')).strip()
    user = User.objects(email=email).first()

    if not user or not otp:
        return Response({'detail': 'Invalid or expired OTP.'}, status=status.HTTP_400_BAD_REQUEST)
    if not user.password_otp_hash or not user.password_otp_expires_at or user.password_otp_expires_at < utcnow():
        return Response({'detail': 'Invalid or expired OTP.'}, status=status.HTTP_400_BAD_REQUEST)
    if user.password_otp_attempts >= MAX_OTP_ATTEMPTS:
        log_otp_event(request, email=email, purpose='forgot_password', status_value='locked', user=user)
        return Response({'detail': 'Too many invalid attempts. Request a new OTP later.'}, status=status.HTTP_429_TOO_MANY_REQUESTS)
    if not check_password(otp, user.password_otp_hash):
        user.password_otp_attempts += 1
        user.save()
        log_otp_event(request, email=email, purpose='forgot_password', status_value='invalid_otp', user=user, metadata={'attempts': user.password_otp_attempts})
        return Response({'detail': 'Invalid or expired OTP.'}, status=status.HTTP_400_BAD_REQUEST)

    change_token = secrets.token_urlsafe(32)
    user.password_otp_hash = ''
    user.password_otp_expires_at = None
    user.password_otp_sent_at = None
    user.password_otp_attempts = 0
    user.password_change_token_hash = make_password(change_token)
    user.password_change_token_expires_at = utcnow() + datetime.timedelta(minutes=CHANGE_TOKEN_EXPIRY_MINUTES)
    user.save()
    log_otp_event(request, email=email, purpose='forgot_password', status_value='verified', user=user)
    return Response({'verification_token': change_token, 'detail': 'OTP verified.'})


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def forgot_password_change(request):
    email = normalized_email(request.data.get('email'))
    token = str(request.data.get('verification_token', ''))
    password = str(request.data.get('new_password', ''))
    confirm_password = str(request.data.get('confirm_password', ''))
    user = User.objects(email=email).first()

    if not user:
        return Response({'detail': 'Password reset session is invalid or expired.'}, status=status.HTTP_400_BAD_REQUEST)
    if password != confirm_password:
        return Response({'detail': 'Passwords do not match.'}, status=status.HTTP_400_BAD_REQUEST)
    if (
        not token
        or not user.password_change_token_hash
        or not user.password_change_token_expires_at
        or user.password_change_token_expires_at < utcnow()
        or not check_password(token, user.password_change_token_hash)
    ):
        return Response({'detail': 'Password reset session is invalid or expired.'}, status=status.HTTP_400_BAD_REQUEST)

    password_errors = validate_new_password(password, user)
    if password_errors:
        return Response({'detail': password_errors}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(password)
    user.password_change_token_hash = ''
    user.password_change_token_expires_at = None
    user.save()
    log_otp_event(request, email=email, purpose='forgot_password', status_value='password_updated', user=user)
    return Response({'detail': 'Password Updated Successfully'})


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
    try:
        email = request.data.get('email') or request.data.get('username') or request.POST.get('email') or request.POST.get('username')
        password = request.data.get('password') or request.POST.get('password')
        if email is None or password is None:
            return Response({'detail': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=email, password=password)
        if user is None:
            logger.warning('Login failed invalid credentials email=%s', email)
            return Response({'detail': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)

        now = utcnow()
        user.last_login = now
        user.last_active = now
        user.save()
        refresh = RefreshToken.for_user(user)
        request.user = user
        try:
            log_activity(request, 'login', login_time=now, status_code=200)
        except Exception:
            logger.exception('Login activity logging failed user_id=%s', str(user.id))
        return Response({'access_token': str(refresh.access_token), 'refresh_token': str(refresh)})
    except Exception:
        logger.exception('Login failed with unexpected backend error')
        return Response(
            {'detail': 'Login service is temporarily unavailable. Please try again.'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )


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
