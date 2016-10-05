import logging

from rest_framework import serializers

from apps.orders.models import Invoice
from apps.payment.models import Payment


logger = logging.getLogger(__name__)


class PaymentCreateSerializer(serializers.ModelSerializer):
    invoice_id = serializers.PrimaryKeyRelatedField(queryset=Invoice.objects.all(), source='invoice')
    form_url = serializers.CharField(read_only=True)

    class Meta:
        model = Payment
        fields = ('id', 'form_url', 'invoice_id')


class PaymentSerializer(serializers.ModelSerializer):
    status = serializers.CharField(read_only=True)
    message = serializers.CharField(read_only=True)

    class Meta:
        model = Payment
        fields = ('id', 'status', 'message')
