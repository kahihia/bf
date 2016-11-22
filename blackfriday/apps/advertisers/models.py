import collections
import itertools

import operator
from functools import reduce

from django.conf import settings
from django.db import models
from django.db.models import Q, Sum
from django.core.urlresolvers import reverse

from apps.orders.models import InvoiceStatus, InvoiceOption
from apps.catalog.models import Category
from apps.promo.models import Option
from django.utils import timezone

from libs.db.fields import LongUrlField


class ModerationStatus:
    new = 0
    waiting = 1
    confirmed = 2
    rejected = 3


class HeadBasis:
    charter = 0
    proxy = 1


class AdvertiserType:
    REGULAR = 0
    AKIT = 10
    ADMIT_AD = 11
    PARTNERS = 12
    SUPERNOVA = 20


class AdvertiserProfile(models.Model):
    HEAD_BASISES = (
        (HeadBasis.charter, 'На основании устава'),
        (HeadBasis.proxy, 'На основании доверенности')
    )

    TYPES = (
        (AdvertiserType.REGULAR, 'Обычный'),
        (AdvertiserType.AKIT, 'АКИТ'),
        (AdvertiserType.ADMIT_AD, 'AdmitAd'),
        (AdvertiserType.PARTNERS, 'Партнёры'),
        (AdvertiserType.SUPERNOVA, 'Сверхновая'),
    )

    type = models.IntegerField(choices=TYPES, default=AdvertiserType.REGULAR)

    account = models.CharField(max_length=20, null=True, blank=True, verbose_name='Банковский счет')
    inn = models.CharField(max_length=12, null=True, blank=True, unique=True, verbose_name='ИНН')
    bik = models.CharField(max_length=9, null=True, blank=True, verbose_name='БИК')
    kpp = models.CharField(max_length=9, null=True, blank=True, verbose_name='КПП')
    korr = models.CharField(max_length=20, null=True, blank=True, verbose_name='Корр. счет')
    bank = models.CharField(max_length=100, null=True, blank=True, verbose_name='Банк')
    address = models.CharField(max_length=250, null=True, blank=True, verbose_name='Адрес')
    legal_address = models.CharField(max_length=250, null=True, blank=True, verbose_name='Юридический адрес')
    contact_name = models.CharField(max_length=100, null=True, blank=True, verbose_name='Контактное лицо')
    contact_phone = models.CharField(max_length=32, null=True, blank=True, verbose_name='Телефон контактного лица')
    head_name = models.CharField(max_length=100, null=True, blank=True, verbose_name='ФИО руководителя')
    head_appointment = models.CharField(max_length=250, null=True, blank=True, verbose_name='Должность руковолителя')
    head_basis = models.IntegerField(null=True, blank=True, choices=HEAD_BASISES,
                                     verbose_name='На основании чего действует руководитель')

    class Meta:
        verbose_name = 'Профиль рекламодателя'
        verbose_name_plural = 'Профили рекламодателей'

    @property
    def is_valid(self):
        return (
            self.type > 0 or
            all(
                map(
                    lambda field: field.value_from_object(self) not in (None, ''),
                    filter(lambda f: f.name not in ('kpp', 'head_name', 'head_appointment'), self._meta.fields)
                )
            )
        )

    @property
    def is_supernova(self):
        return self.type == AdvertiserType.SUPERNOVA

    @is_supernova.setter
    def is_supernova(self, value):
        self.type = AdvertiserType.SUPERNOVA & int(value)

    @property
    def inner(self):
        if 10 <= self.type < 20:
            return dict(self.TYPES).get(self.type)

    @inner.setter
    def inner(self, value):
        self.type = dict(map(reversed, filter(lambda x: 10 <= x[0] < 20, self.TYPES))).get(value)

    def __str__(self):
        if self.inn:
            return 'ИНН {}'.format(self.inn)
        else:
            return 'Без ИНН'


class ModeratedMerchantsQueryset(models.QuerySet):
    def moderated(self):
        return self.filter(moderation_status=ModerationStatus.confirmed, slug__isnull=False).exclude(slug='')


class Merchant(models.Model):
    MODERATION_STATUSES = (
        (ModerationStatus.new, 'Не модерировался'),
        (ModerationStatus.waiting, 'Ожидает модерации'),
        (ModerationStatus.confirmed, 'Подтверждён'),
        (ModerationStatus.rejected, 'Отклонён'),
    )

    name = models.CharField(max_length=120, unique=True, verbose_name='Название')
    description = models.TextField(null=True, blank=True, verbose_name='Описание')

    url = LongUrlField(null=True, blank=True, unique=True, verbose_name='URL')
    slug = models.SlugField(null=True, blank=True, unique=True, verbose_name='Слаг')
    promocode = models.CharField(max_length=100, null=True, blank=True, verbose_name='Промо код')

    image = models.ForeignKey('mediafiles.Image', verbose_name='Изображение', null=True)

    partners = models.ManyToManyField('banners.Partner', blank=True, related_name='merchants', verbose_name='Партнеры')
    advertiser = models.ForeignKey('users.User', related_name='merchants', verbose_name='Рекламодатель')

    last_save = models.DateTimeField(null=True, blank=True)

    moderation_comment = models.TextField(null=True, blank=True, verbose_name='Комментарий модератора')
    moderation_status = models.IntegerField(default=ModerationStatus.new, choices=MODERATION_STATUSES,
                                            verbose_name='Статус модерации')
    is_active = models.BooleanField(default=False, verbose_name='Активен')

    logo_categories = models.ManyToManyField('catalog.Category', related_name='merchant_logos')

    receives_notifications = models.BooleanField(default=True, verbose_name='Получает уведомления')
    banner_mailings_count = models.IntegerField(default=0)
    superbanner_mailings_count = models.IntegerField(default=0)

    objects = models.Manager.from_queryset(ModeratedMerchantsQueryset)()

    class Meta:
        verbose_name = 'Магазин'
        verbose_name_plural = 'Магазины'

    def __str__(self):
        return self.name

    def get_promo(self, *statuses, exclude=None):
        qs = self.invoices.filter(promo__isnull=False)

        if exclude:
            if isinstance(exclude, collections.Iterable):
                qs = qs.exclude(id__in=exclude)
            else:
                qs = qs.exclude(id=exclude)

        q_list = []
        if InvoiceStatus.paid in statuses:
            q_list.append(Q(is_paid=True))
        if InvoiceStatus.new in statuses:
            q_list.append(Q(is_paid=False, expired_datetime__gt=timezone.now()))
        if InvoiceStatus.cancelled in statuses:
            q_list.append(Q(is_paid=False, expired_datetime__lte=timezone.now()))

        if q_list:
            qs = qs.filter(reduce(operator.__or__, q_list))

        invoice = qs.order_by('-id').first()
        if invoice:
            return invoice.promo

    @property
    def limits(self):
        options = {}

        def get_options(qs):
            qs = qs.values('option__tech_name').annotate(option_sum=Sum('value'))
            return dict(qs.values_list('option__tech_name', 'option_sum'))

        def get_value(rule):
            value = rule if isinstance(rule, int) else int(options.get(rule, 0))
            value *= settings.LIMITS_RULES_COEFS.get(rule, 1)
            return value

        if self.promo:
            options.update(get_options(self.promo.options))
        options.update(get_options(InvoiceOption.objects.filter(invoice__merchant=self, invoice__is_paid=True)))

        return {
            limit: reduce(operator.add, map(get_value, rules), 0) if self.promo else 0
            for limit, rules in settings.LIMITS_RULES.items()
        }

    @property
    def unused_limits(self):
        products = self.products.all()
        banners = self.banners.prefetch_related('categories')
        limits = self.limits
        return {
            'banner_on_main': (
                len(
                    [b for b in banners if b.on_main and b.type == BannerType.ACTION]
                ) == limits['banner_on_main']
            ),
            'banner_positions': (
                len(
                    [cat for cat in itertools.chain.from_iterable(
                        [b.categories.all() for b in banners if b.type == BannerType.ACTION])]
                ) == limits['banner_positions']
            ),
            'banners': (
                len(
                    [b for b in banners if b.type == BannerType.ACTION]
                ) == limits['banners']
            ),
            'categories': (
                Category.objects.filter(
                    Q(banners__merchant=self) | Q(products__merchant=self)
                ).distinct().count() >= limits['categories']
            ),
            'category_backgrounds': (
                len(
                    list(
                        zip(
                            [b for b in banners if b.type == BannerType.BG_LEFT if not b.on_main],
                            [b for b in banners if b.type == BannerType.BG_RIGHT if not b.on_main],
                        )
                    )
                ) == limits['category_backgrounds']
            ),
            'extra_banner_categories': (
                len(
                    {cat for cat in itertools.chain.from_iterable(
                        [b.categories.all() for b in banners if b.type == BannerType.ACTION])}
                ) == (limits['extra_banner_categories'] + limits['categories'])
            ),
            'logo_categories': (
                len({cat.id for cat in self.logo_categories.all()}) == limits['logo_categories']
            ),
            'main_backgrounds': (
                len(
                    list(
                        zip(
                            [b for b in banners if b.type == BannerType.BG_LEFT and b.on_main],
                            [b for b in banners if b.type == BannerType.BG_RIGHT and b.on_main],
                        )
                    )
                ) == limits['main_backgrounds']
            ),
            'superbanner_categories': (
                len(
                    {cat for cat in itertools.chain.from_iterable(
                        [b.categories.all() for b in banners if b.type == BannerType.SUPER])}
                ) == limits['superbanner_categories']
            ),
            'superbanner_in_mailing': (
                bool(
                    len([b for b in banners if b.type == BannerType.SUPER and b.in_mailing])
                ) == bool(limits['superbanner_in_mailing'])
            ),
            'superbanner_on_main': (
                bool(
                    len([b for b in banners if b.type == BannerType.SUPER and b.on_main])
                ) == bool(limits['superbanner_on_main'])
            ),
            'superbanners': (
                len([b for b in banners if b.type == BannerType.SUPER]) == limits['superbanners']
            ),
            'teasers': (
                len([p for p in products if p.is_teaser]) == limits['teasers']
            ),
            'teasers_on_main': (
                len([p for p in products if p.is_teaser_on_main]) == limits['teasers_on_main']
            ),
            'vertical_banners': (
                len([b for b in banners if b.type == BannerType.VERTICAL]) == limits['vertical_banners']
            ),
            'banner_in_mailing': (
                bool(
                    len([b for b in banners if b.type == BannerType.ACTION and b.in_mailing])
                ) == bool(limits['banner_in_mailing'])
            )
        }

    @property
    def promo(self):
        return self.get_promo(InvoiceStatus.paid)

    @property
    def is_previewable(self):
        return self.invoices.filter(is_paid=True).exists()

    @property
    def preview_url(self):
        return reverse('showcase:merchant-preview', args=(self.id,))

    @property
    def payment_status(self):
        new = self.invoices.filter(is_paid=False, expired_datetime__gt=timezone.now()).exists()
        paid = self.invoices.filter(is_paid=True).exists()
        if not new and paid:
            return InvoiceStatus.paid
        return InvoiceStatus.new

    @property
    def options_count(self):
        return (Option.objects
                .filter(in_invoices__invoice__is_paid=True, in_invoices__invoice__merchant=self)
                .distinct().count())

    @property
    def owner_id(self):
        return self.advertiser.id


ADVERTISER_INNER_TYPES = dict(map(reversed, filter(lambda x: 10 <= x[0] < 20, AdvertiserProfile.TYPES)))


class BannerType:
    SUPER = 0
    ACTION = 10
    VERTICAL = 20
    BG_LEFT = 30
    BG_RIGHT = 40

    @classmethod
    def get(self, key):
        return getattr(self, key.upper())


class BannerQueryset(models.QuerySet):
    def from_moderated_merchants(self):
        return self.filter(
            merchant__moderation_status=ModerationStatus.confirmed, merchant__slug__isnull=False
        ).exclude(merchant__slug='')

    def vertical(self):
        return self.filter(type=BannerType.VERTICAL)

    def super(self):
        return self.filter(type=BannerType.SUPER)

    def action(self):
        return self.filter(type=BannerType.ACTION)


class Banner(models.Model):
    TYPES = (
        (BannerType.SUPER, 'Супербаннер'),
        (BannerType.ACTION, 'Акционный баннер'),
        (BannerType.VERTICAL, 'Вертикальный баннер'),
        (BannerType.BG_LEFT, 'Фон слева'),
        (BannerType.BG_RIGHT, 'Фон справа'),
    )

    type = models.IntegerField(choices=TYPES)
    image = models.ForeignKey('mediafiles.Image', related_name='banners')
    url = LongUrlField()
    on_main = models.BooleanField()
    in_mailing = models.BooleanField()
    categories = models.ManyToManyField('catalog.Category', related_name='banners', blank=True)
    merchant = models.ForeignKey(Merchant, related_name='banners')
    was_mailed = models.BooleanField(default=False)

    objects = models.Manager.from_queryset(BannerQueryset)()

    @property
    def owner_id(self):
        return self.merchant.owner_id
