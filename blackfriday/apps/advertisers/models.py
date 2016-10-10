import collections

import operator
from functools import reduce

from django.db import models
from django.db.models import Q

from apps.orders.models import InvoiceStatus
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


class InnerType:
    AKIT = 'АКИТ'
    ADMIT_AD = 'AdmitAd'
    PARTNERS = 'Партнеры'


class AdvertiserProfile(models.Model):
    HEAD_BASISES = (
        (HeadBasis.charter, 'На основании устава'),
        (HeadBasis.proxy, 'На основании доверенности')
    )

    INNER_TYPES = (
        (InnerType.AKIT, InnerType.AKIT),
        (InnerType.ADMIT_AD, InnerType.ADMIT_AD),
        (InnerType.PARTNERS, InnerType.PARTNERS)
    )

    inner = models.CharField(max_length=10, null=True, blank=True, choices=INNER_TYPES)

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
    on_main = models.BooleanField(default=False)
    in_mailing = models.BooleanField(default=False)
    categories = models.ManyToManyField('catalog.Category', related_name='banners')
    merchant = models.ForeignKey(Merchant, related_name='banners')
