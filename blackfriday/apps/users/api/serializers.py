from django.contrib.auth.hashers import make_password
from rest_framework import serializers

from ..models import User


class UserSerializer(serializers.ModelSerializer):
    password = serializers.RegexField(r'^\w{8,}$$', write_only=True)
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
