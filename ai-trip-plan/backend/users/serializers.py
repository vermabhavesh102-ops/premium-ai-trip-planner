from rest_framework import serializers
from .models import User



class SignupSerializer(serializers.Serializer):
    email = serializers.EmailField()
    full_name = serializers.CharField(required=False, allow_blank=True, default='')
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)





    def validate_email(self, value):
        if User.objects(email=value).first():
            raise serializers.ValidationError(
                'This email is already registered. Please log in or use a different email.'
            )
        return value

    def validate(self, attrs):
        if attrs.get('password') != attrs.get('confirm_password'):
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match'})
        return attrs

    def create(self, validated_data):
        user = User(
            email=validated_data['email'],
            full_name=validated_data.get('full_name', ''),
        )

        user.set_password(validated_data['password'])
        user.save()
        return user



class UserSerializer(serializers.Serializer):
    id = serializers.SerializerMethodField()
    email = serializers.EmailField(read_only=True)
    full_name = serializers.CharField(read_only=True, default='')
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
    full_name = serializers.CharField(required=False, allow_blank=True)

    def update(self, instance, validated_data):
        full_name = validated_data.get('full_name')
        if full_name is not None:
            instance.full_name = full_name.strip()
        instance.save()
        return instance
