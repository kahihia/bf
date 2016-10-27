from functools import partial

from django.conf import settings
from django.core.mail import send_mail
from django.db.models import Q
from django.template.loader import render_to_string

from rest_framework import mixins, viewsets
from rest_framework.decorators import list_route, detail_route
from rest_framework.exceptions import ValidationError
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response

from apps.advertisers.api.serializers.clients import MerchantNotificationsSerializer
from apps.advertisers.models import BannerType
from libs.api.exceptions import BadRequest
from libs.api.permissions import (
    IsAdmin, IsOwner, IsAuthenticated, IsAdvertiser, action_permission, IsManager, IsValidAdvertiser
)

from apps.banners.models import Partner
from apps.catalog.models import Category
from apps.promo.models import Option
from apps.users.models import User

from apps.banners.api.serializers import PartnerTinySerializer
from apps.catalog.api.serializers import CategorySerializer

from ..models import Banner, Merchant, ModerationStatus
from .filters import AdvertiserFilter, MerchantFilter

from .serializers.clients import (AdvertiserSerializer, MerchantSerializer, MerchantListSerializer,
                                  MerchantCreateSerializer, MerchantUpdateSerializer, MerchantModerationSerializer)
from .serializers.materials import AvailableOptionSerializer, LimitSerializer, BannerSerializer


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
            'notifications': MerchantNotificationsSerializer,
        }.get(self.action, MerchantSerializer)

    @list_route(methods=['patch'])
    def notifications(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(request.data)

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

        instance = serializer.save()
        if instance.moderation_status == ModerationStatus.confirmed:
            self.send_moderation_report(instance)

        return Response(serializer.data)

    @detail_route(methods=['get'])
    def limits(self, request, *args, **kwargs):
        merchant = self.get_object()
        limits = [
            {
                'tech_name': limit,
                'value': value
            }
            for limit, value in merchant.limits.items()
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
                if type(request.data) != list:
                    raise TypeError
                cat_list = list(map(int, request.data))
            except (TypeError, ValueError):
                raise BadRequest('Неверные данные')
            if len(cat_list) > len(set(cat_list)):
                raise BadRequest('Значения не должны повторяться')

            cats = Category.objects.filter(Q(merchant__isnull=True) | Q(merchant=merchant), id__in=cat_list)

            if cats.count() < len(cat_list):
                raise BadRequest('Не все ключи присутствуют в базе')

            if len(cat_list) > merchant.limits.get('logo_categories', 0):
                raise BadRequest('Превышены ограничения рекламных возможностей')

            merchant.logo_categories.set(cats)

        serializer = self.get_serializer(merchant.logo_categories.all(), many=True)
        return Response(serializer.data)

    def send_moderation_report(self, instance):
        if not instance.receives_notifications:
            return

        header = ('type', 'url', 'on_main')
        materials = []

        if instance.image:
            materials.append(('Логотип', None, False))

        banners = instance.banners.all()
        banner_types = {
            BannerType.SUPER: 'Супербаннер',
            BannerType.ACTION: 'Акционный баннер',
            BannerType.VERTICAL: 'Вертикальный баннер',
            BannerType.BG_LEFT: 'Фон',
            BannerType.BG_RIGHT: 'Фон',
        }

        for banner in banners.order_by('type', '-on_main'):
            materials.append((banner_types[banner.type], banner.url, banner.on_main))

        teasers = instance.product_set.filter(Q(is_teaser=True) | Q(is_teaser_on_main=True))
        for teaser in teasers.order_by('is_teaser_on_main'):
            materials.append(('Тизер', teaser.url, teaser.is_teaser_on_main))

        send_mail(
            subject='Просьба о помощи от рекламодателя',
            recipient_list=[instance.advertiser.email],
            from_email=settings.DEFAULT_FROM_EMAIL,
            html_message=render_to_string(
                'advertisers/messages/report.html',
                {
                    'merchant': instance,
                    'materials': map(dict, map(partial(zip, header), materials)),
                    'products': instance.product_set.count()
                }
            ),
            message=''
        )


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
