from libs.api.permissions import IsAuthenticated, IsAdmin, IsAdvertiser, IsOwner, action_permission, IsManager
from rest_framework import viewsets
from rest_framework.decorators import list_route, detail_route
from rest_framework.response import Response
from django.template.loader import render_to_string
from django.http.response import StreamingHttpResponse
from django.conf import settings
from weasyprint import HTML
from rest_framework.exceptions import ValidationError

from ..models import Invoice
from .filters import InvoiceFilter
from .serializers import InvoiceSerializer, InvoiceStatusSerializer, InvoiceStatusBulkSerializer
from io import BytesIO


class InvoiceViewSet(viewsets.ModelViewSet):
    permission_classes = [
        IsAuthenticated,
        IsAdmin |
        IsAdvertiser & IsOwner & action_permission('list', 'retrieve', 'create', 'update', 'partial_update') |
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
            qs = qs.filter(merchant__advertiser=user)
        return qs

    @list_route(methods=['patch', 'put'])
    def statuses(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        obj_list = serializer.save()
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

        output = BytesIO()
        HTML(
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
