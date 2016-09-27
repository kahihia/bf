import io
import weasyprint

from django.template.loader import render_to_string
from django.http.response import StreamingHttpResponse
from django.conf import settings

from rest_framework import viewsets
from rest_framework.decorators import list_route, detail_route
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from libs.api.permissions import IsAuthenticated, IsAdmin, IsAdvertiser, IsOwner, action_permission, IsManager

from ..models import Invoice
from .filters import InvoiceFilter
from .serializers import InvoiceSerializer, InvoiceUpdateSerializer, InvoiceStatusBulkSerializer


class InvoiceViewSet(
        mixins.ListModelMixin, mixins.CreateModelMixin, mixins.RetrieveModelMixin,
        mixins.UpdateModelMixin, viewsets.GenericViewSet):
    permission_classes = [
        IsAuthenticated,
        IsAdmin |
        IsManager |
        IsAdvertiser & IsOwner & action_permission('list', 'retrieve', 'create', 'update', 'partial_update', 'receipt')
    ]
    queryset = Invoice.objects.all()
    filter_class = InvoiceFilter

    def get_serializer_class(self):
        if 'update' in self.action:
            return InvoiceUpdateSerializer
        if self.action == 'statuses':
            return InvoiceStatusBulkSerializer
        return InvoiceSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if self.action == 'list' and user.role == 'advertiser':
            qs = qs.filter(merchant__advertiser=user)
        return qs

    @list_route(methods=['post'])
    def statuses(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        obj_list = Invoice.objects.filter(id__in=serializer.save())
        return Response(InvoiceSerializer(obj_list, many=True, context=serializer.context).data)

    @detail_route(methods=['get'])
    def receipt(self, request, *args, **kwargs):
        obj = self.get_object()
        if not obj.merchant.advertiser.profile or not(
                all([
                    obj.merchant.advertiser.profile.inn,
                    obj.merchant.advertiser.profile.kpp,
                    obj.merchant.advertiser.profile.legal_address
                ])):
            raise ValidationError('не заполнены реквизиты')

        output = io.BytesIO()
        weasyprint.HTML(
            string=render_to_string(
                'orders/invoice-payment.html',
                {
                    'object': obj,
                    'advertiser': obj.merchant.advertiser,
                    'account': settings.BANK_ACCOUNT,
                }
            ),
            base_url=settings.SITE_URL
        ).write_pdf(output)
        output.seek(0)
        response = StreamingHttpResponse(output, content_type='application/pdf')
        response['Content-Disposition'] = (
            'attachment; filename="счет на оплату №{} от {}.csv"'.format(obj.id, obj.created_datetime)
        )

        return response
