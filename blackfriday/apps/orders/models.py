from math import ceil

from django.db import models
from django.db.models import F, Sum


class InvoiceStatus:
    new = 0
    paid = 1
    cancelled = 2


class Invoice(models.Model):
    STATUSES = (
        (InvoiceStatus.new, 'Не оплачен'),
        (InvoiceStatus.paid, 'Оплачен'),
        (InvoiceStatus.cancelled, 'Отменен')
    )

    created_datetime = models.DateTimeField(auto_now_add=True, verbose_name='Время создания')
    status = models.IntegerField(choices=STATUSES, default=InvoiceStatus.new, verbose_name='Статус')

    sum = models.IntegerField(default=0, verbose_name='Сумма')
    discount = models.IntegerField(default=0, verbose_name='Скидка')

    merchant = models.ForeignKey('advertisers.Merchant', related_name='invoices', verbose_name='Магазин')
    promo = models.ForeignKey('promo.Promo', null=True, blank=True, verbose_name='Промо')

    class Meta:
        verbose_name = 'Счёт'
        verbose_name_plural = 'Счета'

    def calculate_total(self, commit=True):
        if self.status > InvoiceStatus.new:
            return

        total = self.options.annotate(subtotal=F('value') * F('price')).aggregate(total=Sum('subtotal'))['total']
        if self.promo:
            total += self.promo.price
        if self.discount:
            total *= (1 - self.discount / 100)

        if self.promo and self.merchant.get_promo(InvoiceStatus.paid, InvoiceStatus.new):
            total -= self.merchant.promo.price

        self.sum = ceil(total)
        if commit:
            self.save()

    @property
    def owner_id(self):
        return self.advertiser_id


class InvoiceOption(models.Model):
    invoice = models.ForeignKey(Invoice, related_name='options', verbose_name='Счёт')
    option = models.ForeignKey('promo.Option', related_name='in_invoices', verbose_name='Опция')

    value = models.IntegerField(verbose_name='Количество')
    price = models.IntegerField(verbose_name='Цена')

    class Meta:
        verbose_name = 'Опция в счёте'
        verbose_name_plural = 'Опции в счёте'
