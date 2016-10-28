import logging

from pysberbps import SberRequestError
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from apps.orders.models import Invoice
from apps.payment.models import Payment


logger = logging.getLogger(__name__)


class PaymentCreateSerializer(serializers.ModelSerializer):
    invoice_id = serializers.PrimaryKeyRelatedField(
        queryset=Invoice.objects.filter(payment__isnull=True), source='invoice',
        error_messages={'does_not_exist': 'Недопустимый первичный ключ'}
    )
    form_url = serializers.CharField(read_only=True)

    class Meta:
        model = Payment
        fields = ('form_url', 'invoice_id')

    def create(self, validated_data):
        try:
            return super().create(validated_data)
        except SberRequestError as e:
            raise ValidationError(
                {
                    'code': e.code,
                    'message': e.desc
                }
            )


class PaymentSerializer(serializers.ModelSerializer):
    status = serializers.CharField()
    message = serializers.CharField()

    class Meta:
        model = Payment
        fields = ('invoice_id', 'status', 'message')
