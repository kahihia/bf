import collections

import operator
from functools import partial
from functools import reduce

from django.conf import settings
from django.db import models
from django.db.models import Q, Sum

from apps.orders.models import InvoiceStatus, InvoiceOption
from apps.promo.models import Option
from django.utils import timezone


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
        return (self.type > 0 or
                all(map(lambda field: field.value_from_object(self) not in (None, ''), self._meta.fields)))

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


class Merchant(models.Model):
    MODERATION_STATUSES = (
        (ModerationStatus.new, 'Не модерировался'),
        (ModerationStatus.waiting, 'Ожидает модерации'),
        (ModerationStatus.confirmed, 'Подтверждён'),
        (ModerationStatus.rejected, 'Отклонён'),
    )

    name = models.CharField(max_length=120, unique=True, verbose_name='Название')
    description = models.TextField(null=True, blank=True, verbose_name='Описание')

    url = models.URLField(null=True, blank=True, unique=True, verbose_name='URL')
    slug = models.SlugField(null=True, blank=True, unique=True, verbose_name='Слаг')
    promocode = models.CharField(max_length=100, null=True, blank=True, verbose_name='Промо код')

    image = models.ForeignKey('mediafiles.Image', verbose_name='Изображение', null=True)

    partners = models.ManyToManyField('banners.Partner', blank=True, related_name='merchants', verbose_name='Партнеры')
    advertiser = models.ForeignKey('users.User', related_name='merchants', verbose_name='Рекламодатель')

    moderation_comment = models.TextField(null=True, blank=True, verbose_name='Комментарий модератора')
    moderation_status = models.IntegerField(default=ModerationStatus.new, choices=MODERATION_STATUSES,
                                            verbose_name='Статус модерации')
    is_active = models.BooleanField(default=False, verbose_name='Активен')

    logo_categories = models.ManyToManyField('catalog.Category', related_name='merchant_logos')

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
            return rule if isinstance(rule, int) else int(options.get(rule, 0))

        if self.promo:
            options.update(get_options(self.promo.options))
        options.update(get_options(InvoiceOption.objects.filter(invoice__merchant=self, invoice__is_paid=True)))

        return {
            limit: reduce(operator.add, map(get_value, rules), 0)
            for limit, rules in settings.LIMITS_RULES.items()
        }

    @property
    def promo(self):
        return self.get_promo(InvoiceStatus.paid)

    @property
    def is_previewable(self):
        return self.invoices.filter(is_paid=True).exists()

    @property
    def preview_url(self):
        # ToDo: реверсить страницу превью
        return ''

    @property
    def payment_status(self):
        new = self.invoices.filter(is_paid=False, expired_datetime__lte=timezone.now()).exists()
        paid = self.invoices.filter(is_paid=True).exists()
        if not new and paid:
            return InvoiceStatus.paid
        return InvoiceStatus.new

    @property
    def options_count(self):
        return Option.objects.filter(in_invoices__invoice__is_paid=True).distinct().count()

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
    url = models.URLField()
    on_main = models.BooleanField()
    in_mailing = models.BooleanField()
    categories = models.ManyToManyField('catalog.Category', related_name='banners')
    merchant = models.ForeignKey(Merchant, related_name='banners')

    @property
    def owner_id(self):
        return self.merchant.owner_id
