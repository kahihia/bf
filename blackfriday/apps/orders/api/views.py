from libs.api.permissions import IsAuthenticated, IsAdmin, IsAdvertiser, IsOwner, action_permission, IsManager
from rest_framework import viewsets
from rest_framework.decorators import list_route
from rest_framework.response import Response

from ..models import Invoice
from .filters import InvoiceFilter
from .serializers import InvoiceSerializer, InvoiceStatusSerializer, InvoiceStatusBulkSerializer


class InvoiceViewSet(viewsets.ModelViewSet):
    permission_classes = [
        IsAuthenticated,
        IsAdmin |
        IsAdvertiser & IsOwner & action_permission('list', 'retrieve', 'create') |
        IsManager & action_permission('list', 'retrieve', 'update', 'partial_update', 'statuses')
    ]
    queryset = Invoice.objects.all()
    filter_class = InvoiceFilter

    def get_serializer_class(self):
        if 'update' in self.action:
            return InvoiceStatusSerializer
        if self.action == 'statuses':
            return InvoiceStatusBulkSerializer
        return InvoiceSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if self.action == 'list' and user.role == 'advertiser':
            qs = qs.filter(advertiser=user)
        return qs

    @list_route(methods=['patch', 'put'])
    def statuses(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        obj_list = serializer.save()
        return Response(InvoiceSerializer(obj_list, many=True, context=serializer.context).data)
