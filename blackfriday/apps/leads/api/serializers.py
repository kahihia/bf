from rest_framework import serializers

from apps.users.models import User

from ..models import Subscriber, AdvertiserRequest, AdvertiserRequestStatus
from rest_framework.exceptions import ValidationError


class UserResponsibleSerializer(serializers.ModelSerializer):
    display_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'display_name']

    def get_display_name(self, obj):
        return obj.name or 'Аноним ({})'.format(obj.email)


class SubscriberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscriber
        fields = ['id', 'name', 'email']


class AdvertiserRequestSerializer(serializers.ModelSerializer):
    user_responsible = UserResponsibleSerializer()

    class Meta:
        model = AdvertiserRequest
        fields = ['id', 'name', 'organization_name', 'phone', 'email', 'comment',
                  'status', 'datetime_created', 'datetime_updated', 'user_responsible']
        read_only_fields = ['status', 'datetime_created', 'datetime_updated', 'user_responsible']


class AdvertiserRequestStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdvertiserRequest
        fields = ['status']

    def to_representation(self, instance):

        return AdvertiserRequestSerializer().to_representation(instance)

    def update(self, instance, validated_data):
        if (
                instance.status == AdvertiserRequestStatus.new and
                validated_data['status'] == AdvertiserRequestStatus.in_process):
            instance.user_responsible_id = self.context['request'].user.id
        return super().update(instance, validated_data)

    def validate_status(self, value):
        if (self.instance.status, value) not in AdvertiserRequestStatus.ALLOWED_TRANSITIONS:
            raise ValidationError('transition_not_allowed')
        return value
