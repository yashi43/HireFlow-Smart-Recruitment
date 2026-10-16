
import re

from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.authtoken.models import Token

from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, trim_whitespace=False)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role']

    def validate_username(self, value):
        if not value.strip():
            raise serializers.ValidationError('Username cannot be empty.')
        return value.strip()

    def validate_email(self, value):
        value = value.strip().lower()
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                'An account with this email already exists.'
            )
        return value

    def validate_password(self, value):
        errors = []

        if len(value) < 8:
            errors.append('at least 8 characters')
        if not re.search(r'[A-Z]', value):
            errors.append('one uppercase letter')
        if not re.search(r'[a-z]', value):
            errors.append('one lowercase letter')
        if not re.search(r'\d', value):
            errors.append('one number')
        if not re.search(r'[^A-Za-z0-9]', value):
            errors.append('one special character')

        if errors:
            raise serializers.ValidationError(
                'Password must contain ' + ', '.join(errors) + '.'
            )

        return value

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate(self, data):
        user = authenticate(
            username=data['username'],
            password=data['password']
        )

        if user is None:
            raise serializers.ValidationError(
                'Invalid username or password.'
            )

        token, _ = Token.objects.get_or_create(user=user)

        return {
            'token': token.key,
            'username': user.username,
            'email': user.email,
            'role': user.role,
        }
