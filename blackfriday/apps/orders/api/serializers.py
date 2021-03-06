import operator

from functools import reduce
from math import ceil

from django.conf import settings
from django.utils import timezone

from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from apps.advertisers.models import Merchant, ModerationStatus
from apps.promo.models import Option, Promo

from apps.advertisers.api.serializers.clients import AdvertiserTinySerializer, MerchantTinySerializer
from apps.promo.api.serializers import PromoTinySerializer

from ..models import Invoice, InvoiceOption, InvoiceStatus


class InvoiceOptionSerializer(serializers.ModelSerializer):
    id = serializers.PrimaryKeyRelatedField(source='option', queryset=Option.objects.all())
    name = serializers.SlugRelatedField(source='option', slug_field='name', read_only=True)

    class Meta:
        model = InvoiceOption
        fields = ('id', 'name', 'value', 'price')
        extra_kwargs = {
            'price': {'required': False, 'allow_null': True, 'min_value': 0},
            'value': {'min_value': 0}
        }

    def validate(self, attrs):
        user = self.context['request'].user

        if not attrs.get('price') or user.role == 'advertiser':
            attrs['price'] = attrs['option'].price

        if attrs['price'] == 0 and user.role != 'admin':
            raise ValidationError('Обратитесь к менеджеру')

        return attrs


class InvoiceSerializer(serializers.ModelSerializer):
    expired_date = serializers.DateTimeField(source='expired_datetime', format='%Y-%m-%d', read_only=True)

    advertiser = AdvertiserTinySerializer(source='merchant.advertiser', read_only=True)
    merchant = MerchantTinySerializer(read_only=True)
    promo = PromoTinySerializer(read_only=True)

    merchant_id = serializers.PrimaryKeyRelatedField(queryset=Merchant.objects.all(), write_only=True)
    promo_id = serializers.PrimaryKeyRelatedField(queryset=Promo.objects.all(),
                                                  write_only=True, allow_null=True, required=False)

    options = InvoiceOptionSerializer(many=True, required=False)

    status = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        fields = ('id', 'status', 'sum', 'discount', 'created_datetime', 'expired_date',
                  'advertiser', 'merchant', 'merchant_id', 'promo', 'promo_id', 'options')
        read_only_fields = ('id', 'sum')
        extra_kwargs = {
            'discount': {'min_value': 0, 'max_value': 100, 'allow_null': True, 'required': False}
        }

    def get_status(self, obj):
        return obj.status

    def get_extra_kwargs(self):
        kwargs = super().get_extra_kwargs()
        user = self.context['request'].user
        if user.role == 'advertiser':
            kwargs['discount'] = {'read_only': True}
        return kwargs

    def validate_options(self, value):
        if len(set(x['option'] for x in value)) < len(value):
            raise ValidationError('Опции не могут повторяться')
        return value

    def validate_merchant_id(self, value):
        user = self.context['request'].user
        if user.role == 'advertiser' and value.advertiser != user:
            raise ValidationError('Неверный магазин')
        return value

    def validate_promo_id(self, value):
        user = self.context['request'].user
        if user.role != 'admin' and value.is_custom:
            raise ValidationError('Разрешено только для администратора')
        return value

    def validate_discount(self, value):
        return value or 0

    def validate(self, attrs):
        merchant = attrs['merchant'] = attrs.pop('merchant_id')

        promo = attrs['promo'] = attrs.pop('promo_id', None)
        options = attrs.get('options', [])

        if not (promo or options):
            raise ValidationError('Нет ни пакета, ни опций')

        if promo:
            unpaid = merchant.invoices.filter(promo__isnull=False, is_paid=False, expired_datetime__gt=timezone.now())
            if unpaid.exists():
                raise ValidationError('У вас есть неоплаченный пакет')
            if merchant.promo:
                if merchant.promo.price > promo.price:
                    raise ValidationError('Нельзя назначить более дешёвый пакет')
                if merchant.promo == promo:
                    raise ValidationError('Нельзя назначить уже купленный пакет')

        if options:
            promo = promo or merchant.promo

            if promo:
                available_options = promo.available_options.all()
            else:
                raise ValidationError('Нет назначенного пакета')

            if not promo.is_custom:
                for option in options:
                    if option['option'] not in available_options:
                        raise ValidationError('Не все опции доступны для покупки')

            if reduce(operator.__or__, map(lambda x: x['option'].is_required, options), False):
                raise ValidationError('Нельзя заказать пакетную опцию')

        count = merchant.invoices.filter(expired_datetime__gt=timezone.now(), is_paid=False).count()
        if count >= settings.INVOICE_NEW_LIMIT:
            raise ValidationError('Нельзя создать больше {} неоплаченных счетов'.format(settings.INVOICE_NEW_LIMIT))

        attrs['sum'] = self.calculate_sum(merchant, promo, attrs.get('options'), attrs.get('discount'))

        if attrs['sum'] < 0:
            raise ValidationError('Нельзя создавать отрицательные счета')

        return attrs

    def calculate_sum(self, merchant, promo, options, discount):
        total = 0

        if options:
            total += reduce(operator.add, map(lambda option: option['value'] * option['price'], options), 0)
        if promo:
            total += promo.price
        if discount:
            total *= (100 - discount) / 100

        if promo:
            last_promo = merchant.get_promo(InvoiceStatus.paid, InvoiceStatus.new)
            if last_promo:
                total -= last_promo.price

        return ceil(total)

    def create(self, validated_data):
        options = validated_data.pop('options', [])
        invoice = super().create(validated_data)
        InvoiceOption.objects.bulk_create(InvoiceOption(invoice=invoice, **option) for option in options)
        return invoice


class InvoiceUpdateSerializer(serializers.ModelSerializer):
    expired_date = serializers.DateTimeField(source='expired_datetime', input_formats=['%Y-%m-%d'], required=False)
    status = serializers.ChoiceField(choices=Invoice.STATUSES)

    class Meta:
        model = Invoice

    def get_default_field_names(self, declared_fields, model_info):
        fields = ['status']
        user = self.context['request'].user
        if user.role == 'admin':
            fields.append('expired_date')
        return fields

    def validate_status(self, value):
        user = self.context['request'].user
        if user.role == 'advertiser' and value != InvoiceStatus.cancelled:
            raise ValidationError('Вы можете только отменить свой счет')
        return value

    def validate_expired_date(self, value):
        if value <= self.instance.expired_datetime:
            raise ValidationError('Нельзя уменьшить время истечения')
        return value

    def update(self, instance, validated_data):
        paid = instance.is_paid
        status = validated_data.pop('status', None)
        if status:
            instance.status = status

        instance = super().update(instance, validated_data)

        if paid != instance.is_paid:
            instance.merchant.moderation_status = ModerationStatus.new
            instance.merchant.save()

        return instance

    def create(self, validated_data):
        raise NotImplementedError

    def to_representation(self, instance):
        return InvoiceSerializer(context=self.context).to_representation(instance)


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
        invoices = Invoice.change_status(
            [invoice.id for invoice in validated_data['invoices']],
            validated_data['status']
        )

        reset = [
            invoice.id for invoice in filter(
                lambda invoice: (invoice.is_paid != (validated_data['status'] == InvoiceStatus.paid)),
                validated_data['invoices']
            )
        ]

        Merchant.objects.filter(invoices__id__in=reset).update(moderation_status=ModerationStatus.new)
        return invoices

    def update(self, instance, validated_data):
        return self.bulk_update(validated_data)

    def create(self, validated_data):
        return self.bulk_update(validated_data)
