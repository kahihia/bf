from rest_framework import viewsets, mixins

from .serializers import PaymentSerializer, PaymentCreateSerializer
from apps.payment.models import Payment


class PaymentViewSet(
        mixins.RetrieveModelMixin, mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = Payment.objects.all()
    lookup_field = 'invoice_id'

    def get_serializer_class(self):
        if self.action == 'create':
            return PaymentCreateSerializer
        return PaymentSerializer
