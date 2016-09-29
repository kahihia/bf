from django.db.models import Sum
from rest_framework import mixins, viewsets
from rest_framework.decorators import list_route, detail_route
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from libs.api.permissions import IsAdmin, IsOwner, IsAuthenticated, IsAdvertiser, action_permission, IsManager
from apps.banners.api.serializers import PartnerTinySerializer
from apps.banners.models import Partner
from apps.orders.models import InvoiceOption
from apps.promo.models import Option

from .filters import AdvertiserFilter, MerchantFilter
from .serializers import (
    User, AdvertiserSerializer, Merchant, MerchantSerializer, MerchantListSerializer, MerchantCreateSerializer,
    MerchantUpdateSerializer, MerchantModerationSerializer, LimitSerializer, AvailableOptionSerializer
)


class AdvertiserViewSet(mixins.UpdateModelMixin, mixins.RetrieveModelMixin,
                        mixins.ListModelMixin, viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated,
                          IsOwner & action_permission('retrieve', 'update', 'partial_update', 'current') | IsAdmin]
    queryset = User.objects.filter(profile__isnull=False)
    serializer_class = AdvertiserSerializer
    filter_class = AdvertiserFilter

    @list_route(methods=['get', 'put', 'patch', 'head', 'options'], permission_classes=[IsAuthenticated, IsAdvertiser])
    def current(self, request, *args, **kwargs):
        action_map = {'get': 'retrieve', 'put': 'update', 'patch': 'partial_update'}
        return self.__class__.as_view(action_map)(request, pk=request.user.pk, *args, **kwargs)


class MerchantViewSet(viewsets.ModelViewSet):
    filter_class = MerchantFilter
    queryset = Merchant.objects.all()
    permission_classes = [
        IsAuthenticated,
        IsAdvertiser & IsOwner & action_permission(
            'list', 'retrieve', 'create', 'update', 'partial_update', 'moderation'
        ) |
        IsManager & action_permission(
            'list', 'retrieve', 'moderation'
        ) |
        IsAdmin
    ]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.action == 'list' and self.request.user.role == 'advertiser':
            qs = qs.filter(advertiser=self.request.user)
        return qs

    def get_serializer_class(self):
        return {
            'create': MerchantCreateSerializer,
            'list': MerchantListSerializer,
            'update': MerchantUpdateSerializer,
            'partial_update': MerchantUpdateSerializer,
            'moderation': MerchantModerationSerializer
        }.get(self.action, MerchantSerializer)

    @detail_route(methods=['patch', 'put', 'get'])
    def partners(self, request, *args, **kwargs):
        obj = self.get_object()
        if request.method.lower() in ('put', 'patch'):
            try:
                partners = set(map(int, request.data))
            except (ValueError, TypeError):
                raise ValidationError('Неверный формат данных')

            if Partner.objects.filter(id__in=partners).count() < len(partners):
                raise ValidationError('Партнер не найден')

            obj.partners.clear()
            obj.partners.add(*partners)

        return Response(PartnerTinySerializer(obj.partners.all(), many=True).data)

    @detail_route(methods=['patch', 'put'])
    def moderation(self, request, *args, **kwargs):
        obj = self.get_object()
        serializer = self.get_serializer(obj, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @detail_route(methods=['get'])
    def limits(self, request, *args, **kwargs):
        qs = (
            InvoiceOption
            .objects
            .filter(invoice__merchant=self.get_object(), invoice__is_paid=True)
            .values('option__tech_name')
            .annotate(option_sum=Sum('value'))
        )
        serializer = LimitSerializer(
            data=[{'tech_name': obj['option__tech_name'], 'value': obj['option_sum']} for obj in qs], many=True)
        serializer.is_valid()
        return Response(data=serializer.data)

    @detail_route(methods=['get'], url_path='available-options')
    def available_options(self, request, *args, **kwargs):
        merchant = self.get_object()
        qs = Option.objects.all()
        if merchant.promo:
            qs = qs.filter(available_in_promos__id=self.get_object().promo.id)
        else:
            qs = qs.none()
        # TODO: do it in one or two db requests. for now it quick-coding, but affects a bunch of requests
        serializer = AvailableOptionSerializer(data=filter(lambda x: x.is_available, qs), many=True)
        serializer.is_valid()
        return Response(serializer.data)
