from rest_framework import viewsets, mixins
from rest_framework.exceptions import PermissionDenied

from libs.api.permissions import IsAuthenticated, IsAdmin, IsOwner, IsValidAdvertiser

from apps.orders.models import Invoice

from .serializers import PaymentSerializer, PaymentCreateSerializer
from apps.payment.models import Payment


class PaymentViewSet(
        mixins.RetrieveModelMixin, mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = Payment.objects.all()
    lookup_field = 'invoice_id'
    permission_classes = [IsAuthenticated, IsAdmin | IsValidAdvertiser & IsOwner]

    def get_serializer_class(self):
        if self.action == 'create':
            return PaymentCreateSerializer
        return PaymentSerializer

    def perform_create(self, serializer):
        if (
            not self.request.user.is_admin and
            serializer.validated_data['invoice'].owner_id != self.request.user.id
        ):
            raise PermissionDenied
        super().perform_create(serializer)
