from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from apps.advertisers.models import Merchant
from apps.advertisers.api.serializers import AdvertiserTinySerializer, MerchantTinySerializer

from apps.promo.models import Option, Promo
from apps.promo.api.serializers import PromoTinySerializer

from ..models import Invoice, InvoiceOption, InvoiceStatus


class InvoiceOptionSerializer(serializers.ModelSerializer):
    id = serializers.PrimaryKeyRelatedField(source='option', queryset=Option.objects.all())
    name = serializers.SlugRelatedField(source='option', slug_field='name', read_only=True)

    class Meta:
        model = InvoiceOption
        fields = ('id', 'name', 'value', 'price')
        extra_kwargs = {
            'price': {'required': False, 'allow_null': True}
        }

    def validate(self, attrs):
        user = self.context['request'].user
        if not attrs.get('price') or user.role == 'advertiser':
            attrs['price'] = attrs['option'].price
        return attrs


class InvoiceSerializer(serializers.ModelSerializer):
    advertiser = AdvertiserTinySerializer(source='merchant.advertiser', read_only=True)
    merchant = MerchantTinySerializer(read_only=True)
    promo = PromoTinySerializer(read_only=True)

    merchant_id = serializers.PrimaryKeyRelatedField(queryset=Merchant.objects.all(), write_only=True)
    promo_id = serializers.PrimaryKeyRelatedField(queryset=Promo.objects.all(), write_only=True, allow_null=True)

    options = InvoiceOptionSerializer(many=True)

    class Meta:
        model = Invoice
        fields = ('id', 'status', 'sum', 'discount', 'created_datetime',
                  'advertiser', 'merchant', 'merchant_id', 'promo', 'promo_id', 'options')
        read_only_fields = ('id', 'status', 'sum')

    def get_extra_kwargs(self):
        kwargs = super().get_extra_kwargs()
        user = self.context['request'].user
        if user.role == 'advertiser':
            kwargs['discount'] = {'read_only': True}
            kwargs['merchant_id'] = {'queryset': Merchant.objects.filter(advertiser=user)}
        return kwargs

    def validate(self, attrs):
        merchant = attrs['merchant'] = attrs.pop('merchant_id', None)
        promo = attrs['promo'] = attrs.pop('promo_id', None)

        if not (promo or attrs.get('options')):
            raise ValidationError('Нет ни пакета, ни опций')

        if merchant.promo and promo and merchant.promo.price > promo.price:
            raise ValidationError('Нельзя назначить более дешёвый пакет')

        return attrs

    def create(self, validated_data):
        options = validated_data.pop('options')
        invoice = super().create(validated_data)
        InvoiceOption.objects.bulk_create(InvoiceOption(invoice=invoice, **option) for option in options)
        invoice.calculate_total()
        return invoice


class InvoiceStatusSerializer(serializers.ModelSerializer):
    status = serializers.ChoiceField(choices=Invoice.STATUSES)

    class Meta:
        model = Invoice
        fields = ('status',)

    def validate_status(self, value):
        user = self.context['request'].user
        if user.role == 'advertiser' and value != InvoiceStatus.cancelled:
            raise ValidationError('Вы можете только отменить свой счет')
        return value

    def to_representation(self, instance):
        return InvoiceSerializer().to_representation(instance)


class InvoiceStatusBulkSerializer(serializers.ModelSerializer):
    ids = serializers.ListField(child=serializers.PrimaryKeyRelatedField(queryset=Invoice.objects.all()))
    status = serializers.ChoiceField(choices=Invoice.STATUSES)

    class Meta:
        model = Invoice
        fields = ('ids', 'status')

    def validate(self, attrs):
        attrs['invoices'] = attrs.pop('ids', [])
        return attrs

    def bulk_update(self, validated_data):
        invoices = validated_data.pop('invoices', [])
        self.Meta.model.objects.filter(id__in=[invoice.id for invoice in invoices]).update(**validated_data)
        return invoices

    def update(self, instance, validated_data):
        return self.bulk_update(validated_data)

    def create(self, validated_data):
        return self.bulk_update(validated_data)
