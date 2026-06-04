from rest_framework import serializers
from .models import User


class SignupSerializer(serializers.Serializer):
    email = serializers.EmailField()
    username = serializers.CharField()
    full_name = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True)

    def validate_email(self, value):
        if User.objects(email=value).first():
            raise serializers.ValidationError('Email already in use')
        return value

    def validate_username(self, value):
        if User.objects(username=value).first():
            raise serializers.ValidationError('Username already in use')
        return value

    def create(self, validated_data):
        user = User(
            email=validated_data['email'],
            username=validated_data['username'],
            full_name=validated_data.get('full_name', ''),
        )
        user.set_password(validated_data['password'])
        user.save()
        return user


class UserSerializer(serializers.Serializer):
    id = serializers.SerializerMethodField()
    email = serializers.EmailField(read_only=True)
    username = serializers.CharField(read_only=True)
    full_name = serializers.CharField(read_only=True)
    role = serializers.CharField(read_only=True)
    is_email_verified = serializers.BooleanField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    date_joined = serializers.DateTimeField(read_only=True)
    last_login = serializers.DateTimeField(read_only=True, allow_null=True)
    last_logout = serializers.DateTimeField(read_only=True, allow_null=True)
    last_active = serializers.DateTimeField(read_only=True, allow_null=True)

    def get_id(self, obj):
        return str(obj.id)
