from rest_framework import serializers
from .models import User


class SignupSerializer(serializers.Serializer):
    email = serializers.EmailField()
    username = serializers.CharField(required=False, allow_blank=True)
    full_name = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True)


    def validate_email(self, value):
        if User.objects(email=value).first():
            raise serializers.ValidationError('Email already in use')
        return value

    def validate_username(self, value):
        if value and User.objects(username=value).first():
            raise serializers.ValidationError('Username already in use')
        return value

    def build_username(self, email):
        base = email.split('@')[0].strip() or 'traveler'
        username = base
        counter = 1
        while User.objects(username=username).first():
            counter += 1
            username = f'{base}{counter}'
        return username

    def create(self, validated_data):
        username = validated_data.get('username') or self.build_username(validated_data['email'])
        user = User(
            email=validated_data['email'],
            username=username,
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
    profile_image = serializers.CharField(read_only=True)
    role = serializers.CharField(read_only=True)
    is_email_verified = serializers.BooleanField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    date_joined = serializers.DateTimeField(read_only=True)
    last_login = serializers.DateTimeField(read_only=True, allow_null=True)
    last_logout = serializers.DateTimeField(read_only=True, allow_null=True)
    last_active = serializers.DateTimeField(read_only=True, allow_null=True)

    def get_id(self, obj):
        return str(obj.id)



class ProfileUpdateSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=120, allow_blank=True)
    username = serializers.CharField(max_length=80)

    def validate_username(self, value):
        user = self.context['user']
        existing = User.objects(username=value).first()
        if existing and str(existing.id) != str(user.id):
            raise serializers.ValidationError('Username already in use')
        return value

    def update(self, instance, validated_data):
        instance.full_name = validated_data.get('full_name', instance.full_name).strip()
        instance.username = validated_data.get('username', instance.username).strip()
        instance.save()
        return instance
