import io
import weasyprint
import os.path

from functools import partial
from collections import defaultdict
from datetime import datetime

from django.conf import settings
from django.core.mail import send_mail
from django.db.models import Q, Count
from django.template.loader import render_to_string
from django.http.response import StreamingHttpResponse

from rest_framework import mixins, viewsets
from rest_framework.decorators import list_route, detail_route
from rest_framework.exceptions import ValidationError, PermissionDenied
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response

from apps.advertisers.api.serializers.clients import MerchantNotificationsSerializer
from apps.mailing.utils import (
    send_merchant_creation_mail, send_moderation_success_mail, send_moderation_request_mail, send_moderation_fail_mail
)
from apps.reports.models import LogoStats, TeaserStats, BannerStats, MerchantStats
from libs.api.exceptions import BadRequest
from libs.api.permissions import (
    IsAdmin, IsOwner, IsAuthenticated, IsAdvertiser, action_permission, IsManager, IsValidAdvertiser
)

from apps.banners.models import Partner
from apps.catalog.models import Category
from apps.promo.models import Option
from apps.users.models import User
from apps.showcase.renderers import render_all_pages

from apps.banners.api.serializers import PartnerTinySerializer
from apps.catalog.api.serializers import CategorySerializer

from ..models import Banner, Merchant, ModerationStatus, BannerType, AdvertiserType, AdvertiserProfile, HeadBasis
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

    def perform_update(self, serializer):
        obj = self.get_object()
        instance = serializer.save()
        if obj.is_active != instance.is_active:
            render_all_pages.delay(True)

    def perform_create(self, serializer):
        instance = serializer.save()
        if instance.receives_notifications:
            send_merchant_creation_mail(instance)

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
        serializer = self.get_serializer(data=request.data, partial=False)
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
            render_all_pages.delay(True)
            if instance.receives_notifications:
                send_moderation_success_mail(instance)
        elif instance.moderation_status == ModerationStatus.rejected:
            if instance.receives_notifications:
                send_moderation_fail_mail(instance)
        elif instance.moderation_status == ModerationStatus.waiting:
            if instance.receives_notifications:
                send_moderation_request_mail(instance)

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
            if {cat.id for cat in cats} != {cat.id for cat in merchant.logo_categories.all()}:
                merchant.moderation_status = ModerationStatus.new
                merchant.save()

            merchant.logo_categories.set(cats)

        serializer = self.get_serializer(merchant.logo_categories.all(), many=True)
        return Response(serializer.data)

    def send_moderation_report(self, instance):
        if not instance.receives_notifications:
            return

        header = ('type', 'url', 'on_main')
        materials = []

        if instance.image:
            on_main = (
                instance.promo and
                instance.promo.options.filter(value__gt=0, option__tech_name='logo_on_main').exists()
            )
            materials.append(('Логотип', None, on_main))

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

        teasers = instance.products.filter(Q(is_teaser=True) | Q(is_teaser_on_main=True))
        for teaser in teasers.order_by('is_teaser_on_main'):
            materials.append(('Тизер', teaser.url, teaser.is_teaser_on_main))

        send_mail(
            subject='Отчет о прохождении модерации магазина рекламодателем',
            recipient_list=[instance.advertiser.email],
            from_email=settings.DEFAULT_FROM_EMAIL,
            html_message=render_to_string(
                'advertisers/messages/report.html',
                {
                    'merchant': instance,
                    'materials': map(dict, map(partial(zip, header), materials)),
                    'products': instance.products.count()
                }
            ),
            message=''
        )

    @staticmethod
    def create_report(template_name, file_name, context, request):
        output = io.BytesIO()
        weasyprint.HTML(
            string=render_to_string(
                '{}.html'.format(template_name),
                context,
            ),
            base_url=request.build_absolute_uri()
        ).write_pdf(output)
        output.seek(0)
        response = StreamingHttpResponse(output, content_type='application/pdf')
        response['Content-Disposition'] = (
            'attachment; filename="{}.pdf"'.format(file_name)
        )
        return response

    @detail_route(methods=['get'], url_path='statistics-report')
    def statistics(self, request, *args, **kwargs):
        merchant = self.get_object()

        banner_stats_dict = defaultdict(list)
        banner_stats_qs = BannerStats.objects.filter(
            banner__merchant=merchant).select_related('banner')
        for stats_obj in banner_stats_qs:
            banner_stats_dict[stats_obj.banner.type].append(stats_obj)

        logo_stats_qs = LogoStats.objects.filter(merchant=merchant)
        teaser_stats_qs = TeaserStats.objects.filter(product__merchant=merchant)

        elements = []

        if logo_stats_qs:
            logo_stats = logo_stats_qs[0]
            elements.append(
                {
                    'name': 'Логотип',
                    'shown': logo_stats.times_shown,
                    'clicked': logo_stats.times_clicked
                }
            )

        if banner_stats_qs:
            for banner_type, banner_type_name in Banner.TYPES:
                b_type_stats = banner_stats_dict[banner_type]
                if b_type_stats:
                    if len(b_type_stats) > 1:
                        for number, banner_stats in enumerate(b_type_stats, 1):
                            elements.append(
                                {
                                    'name': '{} №{}'.format(banner_type_name, number),
                                    'shown': banner_stats.times_shown,
                                    'clicked': banner_stats.times_clicked
                                }
                            )
                    else:
                        banner_stats = b_type_stats[0]
                        elements.append(
                            {
                                'name': banner_type_name,
                                'shown': banner_stats.times_shown,
                                'clicked': banner_stats.times_clicked
                            }
                        )

        if teaser_stats_qs:
            if len(teaser_stats_qs) > 1:
                for number, teaser_stats in enumerate(teaser_stats_qs, 1):
                    elements.append(
                        {
                            'name': 'Товар-тизер №{}'.format(number),
                            'shown': teaser_stats.times_shown,
                            'clicked': teaser_stats.times_clicked
                        }
                    )
            else:
                teaser_stats = teaser_stats_qs[0]
                elements.append(
                    {
                        'name': 'Товар-тизер',
                        'shown': teaser_stats.times_shown,
                        'clicked': teaser_stats.times_clicked
                    }
                )

        elements.append(
            {
                'name': 'ИТОГО',
                'shown': sum([el['shown'] for el in elements]),
                'clicked': sum([el['clicked'] for el in elements])
            }
        )

        return self.create_report(
            'reports/statistics',
            'Статистика размещения рекламных материалов',
            {
                'elements': elements,
                'site_url': settings.SITE_URL
            },
            request
        )

    @detail_route(methods=['get'], url_path='act-report')
    def act_report(self, request, *args, **kwargs):
        merchant = self.get_object()
        profile = merchant.advertiser.profile

        stats_qs = MerchantStats.objects.filter(merchant=merchant)
        if stats_qs:
            stats = stats_qs[0]
        else:
            stats = {
                'times_shown': 0,
                'times_clicked': 0,
                'unique_visitors_shown': 0,
                'unique_visitors_clicked': 0
            }

        limits = merchant.limits

        srvcs = [
            {
                'description': service['description'],
                'value': limits[service['tech_name']],
                'is_boolean': service['is_boolean']
            } for service in map(dict, map(partial(zip, ('tech_name', 'is_boolean', 'description')), [
                ('superbanners', False, 'Супербаннеры'),
                ('teasers', False, 'Товары-тизеры'),
                ('superbanner_categories', False, 'Категории размещения супербаннеров'),
                ('superbanner_on_main', True, 'Супербаннер на главной'),
                ('banners', False, 'Акционные баннеры'),
                ('banner_on_main', True, 'Акционный баннер на главной странице'),
                ('banner_in_mailing', True, 'Акционный баннер в рассылке'),
                ('logo_categories', False, 'Уникальные категории размещения логотипа'),
                ('categories', False, 'Уникальные категории размещения товаров и акционных баннеров'),
                ('banner_positions', False, 'Позиции размещения акционных баннеров в категориях'),
                ('products', False, 'Товары'),
                ('extra_banner_categories', False, 'Дополнительный баннер в категории'),
                ('main_backgrounds', False, 'Фоны главной страницы'),
                ('vertical_banners', False, 'Вертикальные баннеры'),
                ('category_backgrounds', False, 'Фоны категорий'),
                ('teasers_on_main', False, 'Товары-тизеры на главной странице'),
                ('superbanner_in_mailing', False, 'Супербаннеры в рассылке')
            ])) if service['tech_name'] in limits
        ]

        services = []
        for srcv in srvcs:
            service = {'description': srcv['description']}
            if srcv['is_boolean']:
                service['value'] = 'Есть' if srcv['value'] else 'Нет'
            else:
                service['value'] = '{} шт.'.format(srcv['value']) if srcv['value'] else None
            services.append(service)

        context = {
            'date': datetime.today(),
            'stats': stats,
            'merchant_name': merchant.name,
            'advertiser_name': merchant.advertiser.name,
            'inn': profile.inn if profile and profile.type == AdvertiserType.REGULAR and profile.inn else '&mdash;',
            'kpp': profile.kpp if profile and profile.type == AdvertiserType.REGULAR and profile.kpp else '&mdash;',
            'head_basis': dict(AdvertiserProfile.HEAD_BASISES)[
                profile.head_basis if profile and profile.head_basis else HeadBasis.proxy].lower(),
            'site_url': settings.SITE_URL,
            'invoices_sum': sum(invoice.sum for invoice in merchant.invoices.all()),
            'services': services,
            'head_name': profile.head_name if profile else None,
            'head_appointment': profile.head_appointment if profile else None
        }

        return self.create_report(
            'reports/act_report',
            'Акт-отчет об указании услуг',
            context,
            request
        )

    @detail_route(methods=['get'], url_path='visual-report')
    def visual_report(self, request, *args, **kwargs):
        merchant = self.get_object()
        if os.path.isfile(os.path.join(settings.SCREENSHOT_ROOT, '{}.png'.format(merchant.id))):
            return self.create_report(
                'reports/visual_report',
                'Визуальный отчет',
                {
                    'site_url': settings.SITE_URL,
                    'screenshot_url': settings.SCREENSHOT_URL,
                    'merchant_id': merchant.id
                },
                request
            )
        else:
            raise ValidationError({
                'detail': 'Для данного магазина отсутствует скриншот'
            })


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

    def get_serializer_context(self):
        return dict(super().get_serializer_context(), **{'merchant': self.get_parent()})

    def perform_create(self, serializer):
        serializer.save(merchant=self.get_parent())

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.was_mailed and instance.type == BannerType.SUPER:
            raise PermissionDenied
        return super().update(request, *args, **kwargs)

    def perform_destroy(self, instance):
        if instance.was_mailed and instance.type == BannerType.SUPER:
            raise PermissionDenied
        instance.merchant.moderation_status = 0
        instance.merchant.save()

        super().perform_destroy(instance)
