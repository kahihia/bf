import collections

from rest_framework import serializers

from apps.users.models import User

from apps.promo.models import Promo
from apps.promo.api.serializers import PromoTinySerializer
from rest_framework.exceptions import ValidationError
from rest_framework.fields import empty

from ..models import AdvertiserProfile, Merchant, ModerationStatus


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdvertiserProfile
        fields = ('account', 'inn', 'bik', 'kpp', 'bank', 'korr', 'address', 'legal_address',
                  'contact_name', 'contact_phone', 'head_name', 'head_appointment', 'head_basis')

    def get_extra_kwargs(self):
        kwargs = super().get_extra_kwargs()
        for field in self.Meta.fields:
            kwargs[field] = dict(kwargs.get(field, {}), allow_null=False, allow_blank=False)
        return kwargs

    def bind(self, field_name, parent):
        super().bind(field_name, parent)
        try:
            self.instance = parent.instance.profile
        except AttributeError:
            pass


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
    class Meta:
        model = User
        fields = ('id', 'name')


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
        if user and user.is_authenticated and user.role == 'advertiser':
            if value != ModerationStatus.waiting:
                raise ValidationError('Неверный статус')
            # ToDo: проверка, все ли материлы заполнены
        return value

    def validate(self, attrs):
        if attrs['moderation_status'] < ModerationStatus.confirmed:
            attrs.pop('moderation_comment', None)
        return attrs


class MerchantSerializer(serializers.ModelSerializer):
    moderation = serializers.SerializerMethodField()
    promo = serializers.SerializerMethodField()

    advertiser = AdvertiserTinySerializer()
    # ToDo: импортировать apps.banners.api.serializers.BannerSerializer
    # banners = BannerSerializer(many=True)

    class Meta:
        model = Merchant
        fields = ('id', 'name', 'url', 'slug', 'description', 'promocode', 'image', 'partners', 'advertiser',
                  'payment_status', 'promo', 'options_count', 'banners', 'is_active', 'is_editable', 'is_previewable',
                  'moderation', 'preview_url')

    def get_moderation(self, obj):
        return MerchantModerationSerializer(obj).data

    def get_promo(self, obj):
        if obj.promo:
            return PromoTinySerializer(obj.promo).data
        return None


class MerchantListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Merchant
        fields = ('id', 'name', 'image', 'payment_status', 'moderation_status', 'promo',
                  'is_active', 'is_editable', 'is_previewable', 'preview_url')


class MerchantCreateSerializer(serializers.ModelSerializer):
    advertiser_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), source='advertiser')

    class Meta:
        model = Merchant
        extra_kwargs = {
            'url': {'allow_null': True, 'allow_blank': False},
            'name': {'allow_null': False, 'allow_blank': False},
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
    promo_id = serializers.PrimaryKeyRelatedField(queryset=Promo.objects.all(), source='promo')

    class Meta:
        model = Merchant

    def get_default_field_names(self, declared_fields, model_info):
        fields = ['name', 'url', 'description', 'promocode', 'image', 'promo_id']
        user = self.context['request'].user
        if user and user.is_authenticated and user.is_admin:
            fields += ['is_active', 'slug']
        return fields

    def validate_promo_id(self, value):
        if (
            self.instance and
            self.instance.promo and
            self.instance.promo.price < value.price and
            not value.is_custom
        ):
            raise ValidationError('Неверный promo_id')
        return value

    def update(self, instance, validated_data):
        if 'promo' in validated_data:
            # ToDo: create invoice
            promo = validated_data.pop('promo')
        return super().update(instance, validated_data)


class MerchantTinySerializer(serializers.ModelSerializer):
    class Meta:
        model = Merchant
        fields = ('id', 'name')
