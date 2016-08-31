from rest_framework import serializers

from ..models import Subscriber, AdvertiserRequest


class SubscriberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscriber
        fields = ['id', 'name', 'email']


class AdvertiserRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdvertiserRequest
        fields = ['id', 'name', 'organization_name', 'phone', 'email', 'comment',
                  'status', 'datetime_created', 'datetime_updated']
        read_only_fields = ['status', 'datetime_created', 'datetime_updated']


class AdvertiserRequestStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdvertiserRequest
        fields = ['status']

    def to_representation(self, instance):
        return AdvertiserRequestSerializer().to_representation(instance)
