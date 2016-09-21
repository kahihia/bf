from django.conf import settings
from django.contrib.auth.hashers import make_password
from libs.recaptcha import recaptcha
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from ..models import User, TokenType, Token


class UserSerializer(serializers.ModelSerializer):
    password = serializers.RegexField(r'^[a-zA-Z0-9]{8,}$', write_only=True)
    role = serializers.ChoiceField(choices=[(x, x) for x in ['admin', 'manager', 'advertiser']])

    class Meta:
        model = User
        fields = ('id', 'email', 'name', 'password', 'role', 'is_active')

    def validate_password(self, value):
        if value:
            return make_password(value)
        return value


class UserUpdateSerializer(UserSerializer):
    class Meta(UserSerializer.Meta):
        fields = ('name', 'password')
        extra_kwargs = {'name': {'allow_blank': False}}

    def to_representation(self, instance):
        return UserSerializer().to_representation(instance)


class RegistrationSerializer(serializers.ModelSerializer):
    captcha = serializers.CharField(write_only=True)
    password = serializers.RegexField(r'^\w{8,}$', write_only=True)
    token = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = ('id', 'name', 'email', 'password', 'captcha', 'role', 'is_active', 'token')
        read_only_fields = ('role', 'is_active')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if 'data' in kwargs:
            try:
                captcha = self.initial_data.get('captcha')
                captcha = self.initial_data.pop('g-recaptcha-response', captcha)
                self.initial_data['captcha'] = captcha
            except AttributeError:
                # If is empty, then it's QueryDict
                pass

    def validate_password(self, value):
        return make_password(value)

    def validate_captcha(self, value):
        request = self.context['request']
        if not recaptcha.is_valid(request, value):
            raise ValidationError('Невалидная капча')
        return value

    def create(self, validated_data):
        validated_data.pop('captcha', None)
        instance = super().create(validated_data)
        instance.role = 'advertiser'
        instance.save()
        return instance

    def get_token(self, obj):
        return Token.create(obj, ttl=settings.VERIFICATION_TTL_HOURS, type=TokenType.REGISTRATION)


class SupportRequestSerializer(serializers.Serializer):
    name = serializers.CharField(required=True)
    phone = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)
    message = serializers.CharField(required=True)
