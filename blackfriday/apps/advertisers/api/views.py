import operator

from functools import reduce

from django.conf import settings
from django.db.models import Sum

from rest_framework import mixins, viewsets
from rest_framework.decorators import list_route, detail_route
from rest_framework.exceptions import ValidationError
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response

from apps.advertisers.api.serializers import BannerSerializer
from apps.catalog.api.serializers import CategorySerializer
from apps.catalog.models import Category
from libs.api.exceptions import BadRequest
from libs.api.permissions import IsAdmin, IsOwner, IsAuthenticated, IsAdvertiser, action_permission, IsManager, IsValidAdvertiser
from apps.banners.api.serializers import PartnerTinySerializer
from apps.banners.models import Partner
from apps.orders.models import InvoiceOption
from apps.promo.models import Option, PromoOption

from ..models import Banner

from .filters import AdvertiserFilter, MerchantFilter
from .serializers import (
    User, AdvertiserSerializer, Merchant, MerchantSerializer, MerchantListSerializer, MerchantCreateSerializer,
    MerchantUpdateSerializer, MerchantModerationSerializer, LimitSerializer, AvailableOptionSerializer
)


class AdvertiserViewSet(mixins.UpdateModelMixin, mixins.RetrieveModelMixin,
                        mixins.ListModelMixin, viewsets.GenericViewSet):
    permission_classes = [
        IsAuthenticated,
        (
            IsOwner & action_permission('retrieve', 'update', 'partial_update', 'current') |
            IsAdmin | IsManager
        )
    ]
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
        IsValidAdvertiser & IsOwner & action_permission(
            'list', 'retrieve', 'create', 'update', 'partial_update',
            'moderation', 'limits', 'available_options', 'logo_categories'
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
            'moderation': MerchantModerationSerializer,
            'logo_categories': CategorySerializer,
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
        merchant, options = self.get_object(), {}

        def get_options(qs):
            qs = qs.values('option__tech_name').annotate(option_sum=Sum('value'))
            return dict(qs.values_list('option__tech_name', 'option_sum'))

        def get_value(rule):
            return rule if isinstance(rule, int) else int(options.get(rule, 0))

        if merchant.promo:
            options.update(get_options(merchant.promo.options))
        options.update(get_options(InvoiceOption.objects.filter(invoice__merchant=merchant, invoice__is_paid=True)))

        limits = [
            {
                'tech_name': limit,
                'value': reduce(operator.add, map(get_value, rules), 0)
            }
            for limit, rules in settings.LIMITS_RULES.items()
        ]

        serializer = LimitSerializer(data=filter(lambda limit: limit['value'], limits), many=True)
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

    @detail_route(methods=['get', 'patch'], url_path='logo-categories')
    def logo_categories(self, request, *args, **kwargs):
        merchant = self.get_object()
        self.check_object_permissions(self.request, merchant)

        if request.method == 'PATCH':
            try:
                cat_list = list(map(int, request.data))
            except (TypeError, ValueError):
                raise BadRequest('Неверные данные')
            if len(cat_list) > len(set(cat_list)):
                raise BadRequest('Значения не должны повторяться')

            cats = Category.objects.filter(id__in=cat_list)
            if cats.count() < len(cat_list):
                raise BadRequest('Не все ключи присутствуют в базе')

            merchant.logo_categories.set(cats)

        serializer = self.get_serializer(merchant.logo_categories.all(), many=True)
        return Response(serializer.data)


class BannerViewSet(viewsets.ModelViewSet):
    queryset = Banner.objects.all()
    serializer_class = BannerSerializer
    permission_classes = [IsAuthenticated, IsAdmin | IsAdvertiser & IsOwner]

    def get_parent(self):
        parent = get_object_or_404(Merchant.objects.all(), id=self.kwargs.get('merchant_pk'))
        self.check_object_permissions(self.request, parent)
        return parent

    def get_queryset(self):
        return super().get_queryset().filter(merchant=self.get_parent())

    def perform_create(self, serializer):
        serializer.save(merchant=self.get_parent())

    def perform_destroy(self, instance):
        instance.merchant.moderation_status = 0
        instance.merchant.save()

        super().perform_destroy(instance)
