from rest_framework import serializers

from apps.users.models import User
from ..models import AdvertiserProfile


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdvertiserProfile
        fields = ('account', 'inn', 'bik', 'kpp', 'okpo', 'address', 'legal_address', 'contact_name', 'contact_phone',
                  'head_name', 'head_appointment', 'head_basis')


class AdvertiserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer()

    class Meta:
        model = User
        fields = ('id', 'name', 'email', 'profile')
        extra_kwargs = {'email': {'read_only': True}}

    def update(self, instance, validated_data):
        if 'profile' in validated_data:
            ProfileSerializer().update(instance.profile, validated_data.pop('profile'))
        return super().update(instance, validated_data)
