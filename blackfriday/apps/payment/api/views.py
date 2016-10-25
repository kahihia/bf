from rest_framework import viewsets, mixins
from rest_framework.exceptions import PermissionDenied

from libs.api.permissions import IsAuthenticated, IsAdmin, IsOwner

from apps.orders.models import Invoice

from .serializers import PaymentSerializer, PaymentCreateSerializer
from apps.payment.models import Payment


class PaymentViewSet(
        mixins.RetrieveModelMixin, mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = Payment.objects.all()
    lookup_field = 'invoice_id'
    permission_classes = [IsAuthenticated, IsAdmin | IsOwner]

    def get_serializer_class(self):
        if self.action == 'create':
            return PaymentCreateSerializer
        return PaymentSerializer

    def perform_create(self, serializer):
        if not Invoice.objects.filter(
                id=serializer.data['invoice_id'], merchant__advertiser_id=self.request.user.id).exists():
            raise PermissionDenied
        super().perform_create(serializer)
