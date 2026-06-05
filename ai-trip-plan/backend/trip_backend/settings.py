import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv
import mongoengine

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv(
    'DJANGO_SECRET_KEY',
    'django-insecure-ReplaceMeWithA32+Byte+MinimumSecureSecretKey123456',
)
DEBUG = os.getenv('DEBUG', '1') == '1'

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '*').split(',')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'core',
    'users.apps.UsersConfig',
    'trips.apps.TripsConfig',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'core.middleware.RequestLoggingMiddleware',
    'core.clickjacking.ClickjackingHeaderBypassMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Security settings
CSRF_COOKIE_SECURE = False if DEBUG else True
SESSION_COOKIE_SECURE = False if DEBUG else True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True

ROOT_URLCONF = 'trip_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'trip_backend.wsgi.application'

AUTHENTICATION_BACKENDS = [
    'users.auth_backends.MongoEngineBackend',
]

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = True

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'users.authentication.MongoJWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': int(os.getenv('PAGE_SIZE', '10')),
    'EXCEPTION_HANDLER': 'trip_backend.error_handlers.drf_exception_handler',
}


SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=int(os.getenv('JWT_ACCESS_MINUTES', '60'))),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=int(os.getenv('JWT_REFRESH_DAYS', '7'))),
    'USER_ID_CLAIM': 'user_id',
}

CORS_ALLOW_ALL_ORIGINS = os.getenv('CORS_ALLOW_ALL', '1') == '1'

EMAIL_BACKEND = os.getenv('EMAIL_BACKEND', 'django.core.mail.backends.smtp.EmailBackend')

# Gmail-compatible defaults (can be overridden via env vars)
# - Use STARTTLS on port 587
# - Use SSL on port 465 if you set EMAIL_USE_TLS=1 and EMAIL_PORT=465
# Note: actual behavior is determined by the Django EMAIL_USE_TLS / EMAIL_PORT values.
EMAIL_TIMEOUT = int(os.getenv('EMAIL_TIMEOUT', '20'))


# If you use SMTP, ensure these env vars are set: EMAIL_HOST, EMAIL_PORT, EMAIL_HOST_USER, EMAIL_HOST_PASSWORD.
# Optional: EMAIL_USE_TLS=1 for TLS.
EMAIL_HOST = os.getenv('EMAIL_HOST', '')


EMAIL_PORT = int(os.getenv('EMAIL_PORT', '25') or 25)
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '')
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', '0') == '1'

# Gmail deliverability / SMTP safety checks
# Recommended for Gmail: host=smtp.gmail.com, port=587, EMAIL_USE_TLS=1
EMAIL_FROM_DEFAULT = os.getenv('EMAIL_FROM_DEFAULT', '') or EMAIL_HOST_USER
DEFAULT_FROM_EMAIL = EMAIL_FROM_DEFAULT or 'TripZen AI <noreply@example.com>'
SERVER_EMAIL = DEFAULT_FROM_EMAIL

# Auto-detect SSL vs TLS expectation (supports Gmail 587/STARTTLS and 465/SSL)
EMAIL_USE_SSL = os.getenv('EMAIL_USE_SSL', '0') == '1'

EMAIL_HOST_SECURE_PORT_HINT = int(os.getenv('EMAIL_HOST_SECURE_PORT_HINT', '587'))

# Fail-fast in production-like runs when OTP/email is configured but SMTP creds are incomplete.
# (Keep DEBUG=1 tolerant.)
_EMAIL_SMTP_CONFIGURED = bool(EMAIL_HOST and EMAIL_HOST_USER and EMAIL_HOST_PASSWORD)


if _EMAIL_SMTP_CONFIGURED and (not EMAIL_PORT or not EMAIL_FROM_DEFAULT):

    if not DEBUG:
        raise RuntimeError(
            'SMTP email is configured but EMAIL_PORT or EMAIL_FROM_DEFAULT is missing.'

        )


LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {'class': 'logging.StreamHandler'},
    },
    'root': {
        'handlers': ['console'],
        'level': os.getenv('LOG_LEVEL', 'INFO'),
    },
    'loggers': {
        # Ensure both `logger = logging.getLogger(__name__)` and `getLogger('users')` paths show up
        'users': {
            'handlers': ['console'],
            'level': os.getenv('LOG_LEVEL', 'INFO'),
            'propagate': False,
        },
        'backend.users': {
            'handlers': ['console'],
            'level': os.getenv('LOG_LEVEL', 'INFO'),
            'propagate': False,
        },
    },
}


# MongoDB Configuration
# Security: Never hardcode credentials. Use environment variables or separate components.
# Preferred option: set MONGO_URI (recommended for Atlas/remote).
# Example:
#   MONGO_URI=mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/trip_db?retryWrites=true&w=majority

_MONGO_URI = os.getenv('MONGO_URI', '')

_MONGO_HOST = os.getenv('MONGO_HOST', 'localhost')
_MONGO_PORT = int(os.getenv('MONGO_PORT', '27017'))
_MONGO_DB_NAME = os.getenv('MONGO_DB_NAME') or os.getenv('MONGODB_DB', 'trip_db')
_MONGO_USERNAME = os.getenv('MONGO_USERNAME', '')
_MONGO_PASSWORD = os.getenv('MONGO_PASSWORD', '')
_MONGO_AUTH_SOURCE = os.getenv('MONGO_AUTH_SOURCE', 'admin')

_MONGO_SERVER_SELECTION_TIMEOUT_MS = int(os.getenv('MONGO_SERVER_SELECTION_TIMEOUT_MS', '3000'))
_MONGO_CONNECT_TIMEOUT_MS = int(os.getenv('MONGO_CONNECT_TIMEOUT_MS', '10000'))
_MONGO_SOCKET_TIMEOUT_MS = int(os.getenv('MONGO_SOCKET_TIMEOUT_MS', '5000'))
_MONGO_MAX_POOL_SIZE = int(os.getenv('MONGO_MAX_POOL_SIZE', '50'))
_MONGO_MIN_POOL_SIZE = int(os.getenv('MONGO_MIN_POOL_SIZE', '10'))
_MONGO_RETRY_WRITES = os.getenv('MONGO_RETRY_WRITES', 'true').lower() == 'true'
_MONGO_RETRY_READS = os.getenv('MONGO_RETRY_READS', 'true').lower() == 'true'
_MONGO_SSL = os.getenv('MONGO_SSL', 'false').lower() == 'true'
_MONGO_SSL_CA_CERTS = os.getenv('MONGO_SSL_CA_CERTS', '')
_MONGO_TLS_ALLOW_INVALID_CERTIFICATES = os.getenv('MONGO_TLS_ALLOW_INVALID_CERTIFICATES', 'false').lower() == 'true'

# Build MongoDB connection parameters
_MONGO_CONNECTION_PARAMS = {
    'alias': 'default',
    'serverSelectionTimeoutMS': _MONGO_SERVER_SELECTION_TIMEOUT_MS,
    'connectTimeoutMS': _MONGO_CONNECT_TIMEOUT_MS,
    'socketTimeoutMS': _MONGO_SOCKET_TIMEOUT_MS,
    'maxPoolSize': _MONGO_MAX_POOL_SIZE,
    'minPoolSize': _MONGO_MIN_POOL_SIZE,
    'retryWrites': _MONGO_RETRY_WRITES,
    'retryReads': _MONGO_RETRY_READS,
}

# If URI is provided, it overrides host/port/username/password composition.
if _MONGO_URI:
    _MONGO_CONNECTION_PARAMS['host'] = _MONGO_URI
    # Some drivers still benefit from specifying db explicitly.
    _MONGO_CONNECTION_PARAMS['db'] = _MONGO_DB_NAME
else:
    _MONGO_CONNECTION_PARAMS.update(
        {
            'db': _MONGO_DB_NAME,
            'host': _MONGO_HOST,
            'port': _MONGO_PORT,
        }
    )

    # Add authentication if credentials are provided
    if _MONGO_USERNAME and _MONGO_PASSWORD:
        _MONGO_CONNECTION_PARAMS['username'] = _MONGO_USERNAME
        _MONGO_CONNECTION_PARAMS['password'] = _MONGO_PASSWORD
        _MONGO_CONNECTION_PARAMS['authSource'] = _MONGO_AUTH_SOURCE

    # Add SSL/TLS configuration if enabled
    if _MONGO_SSL:
        _MONGO_CONNECTION_PARAMS['tls'] = True
        if _MONGO_SSL_CA_CERTS:
            _MONGO_CONNECTION_PARAMS['tlsCAFile'] = _MONGO_SSL_CA_CERTS
        if _MONGO_TLS_ALLOW_INVALID_CERTIFICATES:
            _MONGO_CONNECTION_PARAMS['tlsAllowInvalidCertificates'] = True

# Establish MongoDB connection with error handling
try:
    mongoengine.connect(**_MONGO_CONNECTION_PARAMS)
    if DEBUG:
        print("MongoDB connection established.")
except mongoengine.connection.ConnectionError as e:
    # Keep behavior: don't crash dev server, but log clearly.
    if DEBUG:
        # Avoid logging passwords.
        redacted = dict(_MONGO_CONNECTION_PARAMS)
        if 'password' in redacted:
            redacted['password'] = '***'
        print(f"Warning: MongoDB connection failed: {e}")
        print("MongoDB connection params (redacted):", redacted)
        print("Running without MongoDB connection. Some features may be unavailable.")
    else:
        raise
except Exception as e:
    if DEBUG:
        print(f"Warning: Unexpected error connecting to MongoDB: {e}")
    else:
        raise


# Expose settings for use in other modules
MONGO_DB_NAME = _MONGO_DB_NAME


