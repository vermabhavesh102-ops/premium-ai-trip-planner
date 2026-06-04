import datetime
import uuid
from mongoengine import (
    BooleanField,
    DateTimeField,
    DictField,
    Document,
    EmailField,
    IntField,
    ListField,
    StringField,
)


def utcnow():
    return datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)


class Trip(Document):
    itinerary_id = StringField(required=True, unique=True, default=lambda: str(uuid.uuid4()))
    owner_id = StringField(required=True)
    owner_email = EmailField()
    destination = StringField(required=True)
    source = StringField(default='generated')
    duration_days = IntField(default=1)
    travelers = IntField(default=1)
    maps_embed_url = StringField()
    itinerary = ListField(DictField(), default=list)
    hotels = ListField(DictField(), default=list)
    nearby_places = ListField(DictField(), default=list)
    restaurants = ListField(DictField(), default=list)
    transport = ListField(DictField(), default=list)
    planner_meta = DictField(default=dict)
    permissions = ListField(StringField(), default=list)
    is_deleted = BooleanField(default=False)
    saved_at = DateTimeField(default=utcnow)
    updated_at = DateTimeField(default=utcnow)

    meta = {
        'collection': 'itineraries',
        'ordering': ['-saved_at'],
        'indexes': [
            'itinerary_id',
            'owner_id',
            'owner_email',
            'destination',
            'saved_at',
            {'fields': ['owner_id', '-saved_at']},
            {'fields': ['owner_id', 'itinerary_id'], 'unique': True},
        ],
    }

    def __str__(self):
        return f"Trip to {self.destination} ({self.duration_days}d)"

    def save(self, *args, **kwargs):
        self.updated_at = utcnow()
        return super().save(*args, **kwargs)


class Workspace(Document):
    owner_id = StringField(required=True, unique=True)
    owner_email = EmailField()
    name = StringField(default='Default Workspace')
    itinerary_ids = ListField(StringField(), default=list)
    created_at = DateTimeField(default=utcnow)
    updated_at = DateTimeField(default=utcnow)

    meta = {
        'collection': 'workspaces',
        'indexes': ['owner_id', 'owner_email'],
    }

    def save(self, *args, **kwargs):
        self.updated_at = utcnow()
        return super().save(*args, **kwargs)


class Booking(Document):
    booking_id = StringField(required=True, unique=True, default=lambda: str(uuid.uuid4()))
    owner_id = StringField(required=True)
    itinerary_id = StringField(required=True)
    provider = StringField(default='')
    status = StringField(default='pending')
    details = DictField(default=dict)
    created_at = DateTimeField(default=utcnow)
    updated_at = DateTimeField(default=utcnow)

    meta = {
        'collection': 'bookings',
        'indexes': ['booking_id', 'owner_id', 'itinerary_id', {'fields': ['owner_id', 'itinerary_id']}],
    }

    def save(self, *args, **kwargs):
        self.updated_at = utcnow()
        return super().save(*args, **kwargs)


class ActivityLog(Document):
    ACTIONS = (
        'login',
        'logout',
        'page_visit',
        'click',
        'itinerary_created',
        'itinerary_viewed',
        'itinerary_updated',
        'itinerary_deleted',
        'api_request',
    )

    user_id = StringField()
    user_email = EmailField()
    itinerary_id = StringField()
    action = StringField(choices=ACTIONS, required=True)
    page_visited = StringField()
    click_event = StringField()
    method = StringField()
    path = StringField()
    status_code = IntField()
    login_time = DateTimeField()
    logout_time = DateTimeField()
    last_active_time = DateTimeField(default=utcnow)
    device_info = StringField()
    browser_info = StringField()
    ip_address = StringField()
    metadata = DictField(default=dict)
    created_at = DateTimeField(default=utcnow)

    meta = {
        'collection': 'activity_logs',
        'ordering': ['-created_at'],
        'indexes': [
            'user_id',
            'itinerary_id',
            'action',
            'created_at',
            {'fields': ['user_id', '-created_at']},
            {'fields': ['itinerary_id', '-created_at']},
        ],
    }
