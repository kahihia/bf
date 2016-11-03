from django.db.models import F, Q
from rest_framework import viewsets
from rest_framework.decorators import list_route
from rest_framework.renderers import TemplateHTMLRenderer
from rest_framework.response import Response

from libs.api.permissions import IsAuthenticated, IsAdmin

from apps.landing.models import LandingLogo
from apps.advertisers.models import Merchant

from .serializers import LogoMailingSerializer


class MailingViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_serializer_class(self):
        return LogoMailingSerializer

    @list_route(methods=['get'], renderer_classes=[TemplateHTMLRenderer])
    def banners(self, request, *args, **kwargs):
        return Response({}, template_name='mailing/api/mailing.html')

    @list_route(methods=['get', 'post'], renderer_classes=[TemplateHTMLRenderer])
    def logos(self, request, *args, **kwargs):
        data = {
            'logos': LandingLogo.objects.all()
        }
        if request.method == 'POST':
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            data = serializer.data
        return Response(data, template_name='mailing/api/mailing.html')


class MailingBannersViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated, IsAdmin]

    @list_route(methods=['post'], url_path='increment-counters')
    def increment_counters(self, request, *args, **kwargs):
        Merchant.objects.filter(
            Q(invoices__promo__available_options__tech_name='mailing') |
            Q(invoices__options__option__tech_name='mailing') |
            Q(invoices__promo__options__option__tech_name='mailing'),
            invoices__is_paid=True, banner_mailings_count__lt=F('invoices__options__value')
        ).update(banner_mailings_count=F('banner_mailings_count') + 1)
        Merchant.objects.filter(
            Q(invoices__promo__available_options__tech_name='superbanner_at_mailing') |
            Q(invoices__options__option__tech_name='superbanner_at_mailing') |
            Q(invoices__promo__options__option__tech_name='superbanner_at_mailing'),
            invoices__is_paid=True, superbanner_mailings_count__lt=F('invoices__options__value')
        ).update(superbanner_mailings_count=F('banner_mailings_count') + 1)
        return Response()
