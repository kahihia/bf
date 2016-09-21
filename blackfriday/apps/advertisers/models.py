from django.db import models
from django.db.models import Min

from apps.orders.models import InvoiceStatus
from apps.promo.models import Option


class ModerationStatus:
    new = 0
    waiting = 1
    confirmed = 2
    rejected = 3


class HeadBasis:
    charter = 0
    proxy = 1


class AdvertiserProfile(models.Model):
    HEAD_BASISES = (
        (HeadBasis.charter, 'На основании устава'),
        (HeadBasis.proxy, 'На основании доверенности')
    )

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

    class Meta:
        verbose_name = 'Магазин'
        verbose_name_plural = 'Магазины'

    def __str__(self):
        return self.name

    def get_promo(self, *statuses):
        qs = self.invoices.filter(promo__isnull=False)
        if statuses:
            qs = qs.filter(status__in=statuses)
        invoice = qs.order_by('-id').first()
        if invoice:
            return invoice.promo

    @property
    def banners(self):
        # ToDo: Когда будет релейтед нейм на banners.Banner, убрать
        return []

    @property
    def promo(self):
        return self.get_promo(InvoiceStatus.paid)

    @property
    def is_editable(self):
        return self.invoices.filter(status=InvoiceStatus.paid).exists()

    @property
    def is_previewable(self):
        return self.invoices.filter(status=InvoiceStatus.paid).exists()

    @property
    def preview_url(self):
        # ToDo: реверсить страницу превью
        return ''

    @property
    def payment_status(self):
        status = self.invoices.all().aggregate(status=Min('status'))['status']
        return InvoiceStatus.paid if status == InvoiceStatus.paid else InvoiceStatus.cancelled

    @property
    def options_count(self):
        return Option.objects.filter(in_invoices__invoice__status=InvoiceStatus.paid).distinct().count()

    @property
    def owner_id(self):
        return self.advertiser_id
