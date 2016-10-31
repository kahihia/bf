from math import ceil

from datetime import timedelta

from django.conf import settings
from django.db import models
from django.db.models import F, Sum
from django.utils import timezone


class InvoiceStatus:
    new = 0
    paid = 1
    cancelled = 2


def get_default_expiration_date():
    return timezone.now() + timedelta(days=settings.INVOICE_TTL_DAYS)


class Invoice(models.Model):
    STATUSES = (
        (InvoiceStatus.new, 'Не оплачен'),
        (InvoiceStatus.paid, 'Оплачен'),
        (InvoiceStatus.cancelled, 'Отменен')
    )

    created_datetime = models.DateTimeField(auto_now_add=True, verbose_name='Время создания')
    expired_datetime = models.DateTimeField(default=get_default_expiration_date, verbose_name='Срок истечения')
    is_paid = models.BooleanField(default=False, verbose_name='Оплачено')

    sum = models.IntegerField(default=0, verbose_name='Сумма в рублях')
    discount = models.IntegerField(default=0, verbose_name='Скидка')

    merchant = models.ForeignKey('advertisers.Merchant', related_name='invoices', verbose_name='Магазин')
    promo = models.ForeignKey('promo.Promo', null=True, blank=True, verbose_name='Промо')

    @property
    def owner_id(self):
        return self.merchant.advertiser.id

    @property
    def status(self):
        if self.is_paid:
            return InvoiceStatus.paid
        if self.expired_datetime <= timezone.now():
            return InvoiceStatus.cancelled
        return InvoiceStatus.new

    @status.setter
    def status(self, value):
        if value == InvoiceStatus.paid:
            self.is_paid = True
        else:
            self.is_paid = False
            if value == InvoiceStatus.cancelled:
                self.expired_datetime = timezone.now()
            elif value == InvoiceStatus.new:
                self.expired_datetime = get_default_expiration_date()

    class Meta:
        verbose_name = 'Счёт'
        verbose_name_plural = 'Счета'

    @classmethod
    def change_status(cls, id_list, status=InvoiceStatus.new):
        qs = cls.objects.filter(id__in=id_list)
        exclude, update = {}, {}

        if status == InvoiceStatus.paid:
            exclude['is_paid'] = update['is_paid'] = True
        else:
            exclude['is_paid'] = update['is_paid'] = False
            if status == InvoiceStatus.cancelled:
                exclude['expired_datetime__lte'] = update['expired_datetime'] = timezone.now()
            if status == InvoiceStatus.new:
                exclude['expired_datetime__gt'] = timezone.now()
                update['expired_datetime'] = get_default_expiration_date()

        qs.exclude(**exclude).update(**update)
        return id_list

    def total_number(self):
        return self.options.all().count() + 1 if self.promo else self.options.all().count()


class InvoiceOption(models.Model):
    invoice = models.ForeignKey(Invoice, related_name='options', verbose_name='Счёт')
    option = models.ForeignKey('promo.Option', related_name='in_invoices', verbose_name='Опция')

    value = models.IntegerField(verbose_name='Количество')
    price = models.IntegerField(verbose_name='Цена')

    class Meta:
        verbose_name = 'Опция в счёте'
        verbose_name_plural = 'Опции в счёте'

    def total_price(self):
        return self.price * self.value
