import smtplib

from django.conf import settings
from django.core.mail import EmailMessage
from django.template.loader import render_to_string

from rest_framework import viewsets, mixins
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from libs.api.permissions import ReadOnly, IsAuthenticated, IsAdmin, IsAdvertiser
from libs.api.exceptions import ServiceUnavailable

from ..models import Option, Promo

from .filters import OptionFilter, PromoFilter
from .serializers import OptionSerializer, PromoSerializer, CustomPromoRequestSerializer


class OptionViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Option.objects.all()
    serializer_class = OptionSerializer
    filter_class = OptionFilter


class PromoViewSet(mixins.CreateModelMixin, mixins.DestroyModelMixin, viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated, ReadOnly | IsAdmin]
    queryset = Promo.objects.all()
    serializer_class = PromoSerializer
    filter_class = PromoFilter

    def perform_destroy(self, instance):
        if instance.is_custom and not instance.invoice_set.exists():
            return super().perform_destroy(instance)
        raise PermissionDenied


class CustomPromoRequestsViewSet(viewsets.GenericViewSet):
    serializer_class = CustomPromoRequestSerializer
    permission_classes = [IsAuthenticated, IsAdvertiser]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        message = EmailMessage(
            subject='Заявка на особый рекламный пакет',
            body=render_to_string('promo/messages/request.txt', {'user': request.user, 'message': serializer.data}),
            to=map(lambda x: '"{}" <{}>'.format(*x), settings.PROMO_MANAGERS)
        )

        try:
            message.send()
        except smtplib.SMTPException:
            raise ServiceUnavailable

        return Response()

