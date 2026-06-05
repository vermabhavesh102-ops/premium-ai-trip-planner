import datetime
from django.contrib.auth.hashers import make_password, check_password
from mongoengine import DictField, Document, EmailField, StringField, BooleanField, DateTimeField, IntField


class User(Document):
    ROLES = ('user', 'admin')
    email = EmailField(required=True, unique=True)
    username = StringField(required=True, unique=True)
    full_name = StringField(default='')
    profile_image = StringField(default='')
    password = StringField(required=True)
    role = StringField(choices=ROLES, default='user')
    is_email_verified = BooleanField(default=False)
    email_verified_at = DateTimeField()
    is_active = BooleanField(default=True)
    is_staff = BooleanField(default=False)
    date_joined = DateTimeField(default=datetime.datetime.utcnow)
    last_login = DateTimeField()
    last_logout = DateTimeField()
    last_active = DateTimeField()
    password_otp_hash = StringField(default='')
    password_otp_expires_at = DateTimeField()
    password_otp_sent_at = DateTimeField()
    password_otp_attempts = IntField(default=0)
    password_change_token_hash = StringField(default='')
    password_change_token_expires_at = DateTimeField()

    meta = {
        'collection': 'users',
        'indexes': ['email', 'username', 'last_login', 'last_active'],
    }

    def __str__(self):
        return self.email

    @property
    def pk(self):
        return self.id

    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False

    def get_username(self):
        return self.email or self.username

    def get_email_field_name(self):
        return 'email'

    def get_session_auth_hash(self):
        return self.password

    def set_password(self, raw_password):
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password)

    def get_full_name(self):
        return self.full_name or self.username

    def get_short_name(self):
        return self.username


class PasswordOtpLog(Document):
    PURPOSES = ('forgot_password', 'profile_change')
    STATUSES = (
        'requested',
        'sent',
        'blocked',
        'failed_send',
        'verified',
        'invalid_otp',
        'locked',
        'password_updated',
    )

    email = EmailField(required=True)
    user_id = StringField()
    purpose = StringField(choices=PURPOSES, required=True)
    status = StringField(choices=STATUSES, required=True)
    ip_address = StringField()
    metadata = DictField(default=dict)
    created_at = DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        'collection': 'password_otp_logs',
        'indexes': [
            'email',
            'user_id',
            'purpose',
            'status',
            'created_at',
            {'fields': ['email', 'purpose', '-created_at']},
        ],
    }
