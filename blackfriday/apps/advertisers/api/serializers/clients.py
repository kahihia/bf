from django.db.models import Q
from django.utils import timezone

from rest_framework import serializers, validators
from rest_framework.exceptions import ValidationError, PermissionDenied

from apps.advertisers.models import (
    AdvertiserProfile, Merchant, ModerationStatus, AdvertiserType, ADVERTISER_INNER_TYPES
)
from apps.mediafiles.models import Image
from apps.users.models import User

from apps.mediafiles.api.serializers import ImageSerializer
from apps.promo.api.serializers import PromoTinySerializer
from libs.api.validators import html_validator


class ProfileSerializer(serializers.ModelSerializer):
    inn = serializers.CharField(max_length=12, allow_blank=True, allow_null=True, validators=[
        validators.UniqueValidator(queryset=AdvertiserProfile.objects.all(), message='not_unique')
    ])

    class Meta:
        model = AdvertiserProfile
        fields = ('account', 'inn', 'bik', 'kpp', 'bank', 'korr', 'address', 'legal_address',
                  'contact_name', 'contact_phone', 'head_name', 'head_appointment', 'head_basis',
                  'inner', 'is_supernova')
        extra_kwargs = {}

    def get_extra_kwargs(self):
        kwargs = super().get_extra_kwargs()
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated and request.user.role != 'admin':
            kwargs['inner'] = kwargs.get('inner') or {}
            kwargs['inner']['read_only'] = True
            kwargs['is_supernova'] = kwargs.get('is_supernova') or {}
            kwargs['is_supernova']['read_only'] = True

        return kwargs

    def bind(self, field_name, parent):
        super().bind(field_name, parent)
        try:
            self.instance = parent.instance.profile
        except AttributeError:
            pass

    def validate_inner(self, value):
        if value and value not in ADVERTISER_INNER_TYPES.keys():
            raise ValidationError('Недопустимое значение')
        return value

    def validate(self, attrs):
        request = self.context['request']

        if request.user.is_authenticated and request.user.role == 'admin':
            if 'inner' in attrs and 'is_supernova' in attrs:
                raise ValidationError('Нельзя одновременно изменить эти поля')

            if 'inner' in attrs:
                inner = ADVERTISER_INNER_TYPES.get(attrs.pop('inner'))
                if inner:
                    attrs['type'] = inner
                elif self.instance and self.instance.inner:
                    attrs['type'] = AdvertiserType.REGULAR

            if 'is_supernova' in attrs:
                if attrs.pop('is_supernova'):
                    attrs['type'] = AdvertiserType.SUPERNOVA
                elif self.instance and self.instance.is_supernova:
                    attrs['type'] = AdvertiserType.REGULAR

        elif 'inner' in attrs or 'is_supernova' in attrs:
            raise PermissionDenied('Только администратору доступны эти параметры')

        if 'type' not in attrs:
            attrs['type'] = self.instance.type if self.instance else AdvertiserType.REGULAR

        if (
            attrs.get('type') == AdvertiserType.REGULAR and
            any(
                [
                    value in ('', None)
                    for key, value in attrs.items()
                    if key not in ['kpp', 'head_name', 'head_appointment']
                ])
        ):
            raise ValidationError('Все поля должны быть ненулевыми')

        return attrs


class AdvertiserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer()

    class Meta:
        model = User
        fields = ('id', 'name', 'email', 'profile', 'is_active')
        extra_kwargs = {
            'email': {'read_only': True},
            'is_active': {'read_only': True}
        }

    def update(self, instance, validated_data):
        if 'profile' in validated_data:
            ProfileSerializer().update(instance.profile, validated_data.pop('profile'))
        return super().update(instance, validated_data)


class AdvertiserTinySerializer(serializers.ModelSerializer):
    is_supernova = serializers.BooleanField(source='profile.is_supernova')
    inner = serializers.CharField(source='profile.inner')

    class Meta:
        model = User
        fields = ('id', 'name', 'is_supernova', 'inner')


class MerchantModerationSerializer(serializers.ModelSerializer):
    status = serializers.ChoiceField(choices=Merchant.MODERATION_STATUSES, source='moderation_status')
    comment = serializers.CharField(source='moderation_comment', allow_null=True, allow_blank=True, required=False)

    class Meta:
        model = Merchant
        fields = ['status', 'comment']

    def get_extra_kwargs(self):
        kwargs = super().get_extra_kwargs()
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated and request.user.role == 'advertiser':
            kwargs['comment'] = kwargs.get('comment') or {}
            kwargs['comment']['read_only'] = True
        return kwargs

    def validate_status(self, value):
        user = self.context['request'].user
        if user and user.is_authenticated:
            if user.role == 'advertiser' and value != ModerationStatus.waiting:
                raise ValidationError('Неверный статус')
            if (
                user.role in ['manager', 'advertiser'] and
                value in [ModerationStatus.waiting, ModerationStatus.confirmed]
            ):
                requirements = {
                    'name': self.instance.name,
                    'description': self.instance.description,
                    'url': self.instance.url,
                    'image': self.instance.image,
                    'promo': self.instance.promo,
                    'limits': all(self.instance.unused_limits.values()),
                    'utm_in_banners': self.instance.banners.filter(
                        Q(url__contains='utm_medium') & Q(url__contains='utm_source') & Q(url__contains='utm_campaign')
                    ).count() == self.instance.banners.count()
                }
                deficit = [key for key, value in requirements.items() if not value]

                if deficit:
                    raise ValidationError({'deficit': deficit})
        return value

    def validate(self, attrs):
        if attrs['moderation_status'] < ModerationStatus.confirmed:
            attrs.pop('moderation_comment', None)
        attrs['last_save'] = timezone.now()
        return attrs


class MerchantSerializer(serializers.ModelSerializer):
    moderation = serializers.SerializerMethodField()
    promo = serializers.SerializerMethodField()
    image = ImageSerializer()

    advertiser = AdvertiserTinySerializer()

    class Meta:
        model = Merchant
        fields = ('id', 'name', 'url', 'slug', 'description', 'promocode', 'image', 'partners', 'advertiser',
                  'payment_status', 'promo', 'options_count', 'is_active', 'is_previewable',
                  'moderation', 'preview_url', 'receives_notifications')
        extra_kwargs = {
            'slug': {'allow_blank': False}
        }

    def get_moderation(self, obj):
        return MerchantModerationSerializer(obj).data

    def get_promo(self, obj):
        if obj.promo:
            return PromoTinySerializer(obj.promo).data
        return None


class MerchantListSerializer(serializers.ModelSerializer):
    promo = PromoTinySerializer()
    advertiser = AdvertiserTinySerializer()
    image = ImageSerializer()
    moderation = serializers.SerializerMethodField()

    class Meta:
        model = Merchant
        fields = ('id', 'name', 'image', 'payment_status', 'moderation', 'promo',
                  'is_active', 'is_previewable', 'preview_url', 'advertiser', 'options_count', 'receives_notifications')

    def get_moderation(self, obj):
        return MerchantModerationSerializer(obj).data


class MerchantCreateSerializer(serializers.ModelSerializer):
    advertiser_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), source='advertiser')

    name = serializers.CharField(
        max_length=120, validators=[
            validators.UniqueValidator(queryset=Merchant.objects.all(), message='not_unique')])
    url = serializers.URLField(validators=[
        validators.UniqueValidator(queryset=Merchant.objects.all(), message='not_unique')])

    class Meta:
        model = Merchant
        extra_kwargs = {
            'url': {'allow_null': True, 'allow_blank': False},
            'name': {'allow_null': False, 'allow_blank': False},
            'description': {'validators': [html_validator]},
        }

    def get_default_field_names(self, declared_fields, model_info):
        fields = ['name', 'url']

        user = self.context['request'].user
        if user and user.is_authenticated and user.role == 'admin':
            fields += ['advertiser_id']

        return fields

    def create(self, validated_data):
        user = self.context['request'].user
        if user and user.is_authenticated and user.role == 'advertiser':
            validated_data['advertiser'] = user

        return super().create(validated_data)

    def to_representation(self, instance):
        return MerchantSerializer().to_representation(instance)


class MerchantUpdateSerializer(serializers.ModelSerializer):
    image = serializers.PrimaryKeyRelatedField(
        queryset=Image.objects.all(), required=False, allow_null=True, error_messages={
            'does_not_exist': 'does_not_exist'})

    name = serializers.CharField(
        max_length=120, validators=[
            validators.UniqueValidator(queryset=Merchant.objects.all(), message='not_unique')])
    url = serializers.URLField(validators=[
        validators.UniqueValidator(queryset=Merchant.objects.all(), message='not_unique')])

    class Meta:
        model = Merchant
        extra_kwargs = {
            'description': {'validators': [html_validator]},
            'slug': {'allow_blank': False},
        }

    def get_default_field_names(self, declared_fields, model_info):
        fields = ['name', 'url', 'description', 'promocode', 'image']
        user = self.context['request'].user
        if user and user.is_authenticated and user.is_admin:
            fields += ['is_active', 'slug', 'receives_notifications']
        return fields

    def to_representation(self, instance):
        return MerchantSerializer().to_representation(instance)


class MerchantTinySerializer(serializers.ModelSerializer):
    class Meta:
        model = Merchant
        fields = ('id', 'name')


class MerchantNotificationsSerializer(serializers.Serializer):
    is_enabled = serializers.NullBooleanField(required=True)

    # Это очень странно, но так нужно
    def validate_is_enabled(self, value):
        if value is None:
            raise ValidationError('не может быть Null')
        return value

    def create(self, validated_data):
        receives_notifications = validated_data.get('is_enabled')
        if receives_notifications is not None:
            Merchant.objects.update(receives_notifications=receives_notifications)
        return validated_data
