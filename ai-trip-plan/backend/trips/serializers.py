from rest_framework import serializers
from .models import ActivityLog, Booking, Trip, Workspace


class TripSerializer(serializers.Serializer):
    id = serializers.SerializerMethodField()
    itinerary_id = serializers.CharField(read_only=True)
    owner_id = serializers.CharField(read_only=True, allow_null=True)
    owner_email = serializers.EmailField(read_only=True, allow_null=True)
    destination = serializers.CharField(max_length=160)
    source = serializers.CharField(required=False, default='generated')
    duration_days = serializers.IntegerField(default=1, min_value=1, max_value=60)
    travelers = serializers.IntegerField(default=1, min_value=1, max_value=100)
    maps_embed_url = serializers.CharField(required=False, allow_blank=True)
    itinerary = serializers.ListField(child=serializers.DictField(), default=list)
    hotels = serializers.ListField(child=serializers.DictField(), default=list)
    nearby_places = serializers.ListField(child=serializers.DictField(), default=list)
    restaurants = serializers.ListField(child=serializers.DictField(), default=list)
    transport = serializers.ListField(child=serializers.DictField(), default=list)
    planner_meta = serializers.DictField(default=dict)
    permissions = serializers.ListField(child=serializers.CharField(), required=False)
    saved_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    def get_id(self, obj):
        return str(obj.id) if obj.id else None

    def create(self, validated_data):
        trip = Trip(**validated_data)
        trip.save()
        return trip

    def update(self, instance, validated_data):
        for key, value in validated_data.items():
            setattr(instance, key, value)
        instance.save()
        return instance


class ActivityLogSerializer(serializers.Serializer):
    id = serializers.SerializerMethodField()
    user_id = serializers.CharField(read_only=True, allow_null=True)
    user_email = serializers.EmailField(read_only=True, allow_null=True)
    itinerary_id = serializers.CharField(read_only=True, allow_null=True)
    action = serializers.CharField(read_only=True)
    page_visited = serializers.CharField(read_only=True, allow_null=True)
    click_event = serializers.CharField(read_only=True, allow_null=True)
    method = serializers.CharField(read_only=True, allow_null=True)
    path = serializers.CharField(read_only=True, allow_null=True)
    status_code = serializers.IntegerField(read_only=True, allow_null=True)
    login_time = serializers.DateTimeField(read_only=True, allow_null=True)
    logout_time = serializers.DateTimeField(read_only=True, allow_null=True)
    last_active_time = serializers.DateTimeField(read_only=True, allow_null=True)
    device_info = serializers.CharField(read_only=True, allow_null=True)
    browser_info = serializers.CharField(read_only=True, allow_null=True)
    ip_address = serializers.CharField(read_only=True, allow_null=True)
    metadata = serializers.DictField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)

    def get_id(self, obj):
        return str(obj.id)


class WorkspaceSerializer(serializers.Serializer):
    id = serializers.SerializerMethodField()
    owner_id = serializers.CharField(read_only=True)
    owner_email = serializers.EmailField(read_only=True, allow_null=True)
    name = serializers.CharField(read_only=True)
    itinerary_ids = serializers.ListField(child=serializers.CharField(), read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    def get_id(self, obj):
        return str(obj.id)


class BookingSerializer(serializers.Serializer):
    id = serializers.SerializerMethodField()
    booking_id = serializers.CharField(read_only=True)
    owner_id = serializers.CharField(read_only=True)
    itinerary_id = serializers.CharField()
    provider = serializers.CharField(required=False, allow_blank=True)
    status = serializers.CharField(required=False)
    details = serializers.DictField(required=False)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    def get_id(self, obj):
        return str(obj.id)

    def create(self, validated_data):
        booking = Booking(**validated_data)
        booking.save()
        return booking
