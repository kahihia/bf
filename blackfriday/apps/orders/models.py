from django.db import models


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

    advertiser = models.ForeignKey('users.User', related_name='invoices', verbose_name='Рекламодатель')
    promo = models.ForeignKey('promo.Promo', null=True, blank=True, verbose_name='Промо')

    class Meta:
        verbose_name = 'Счёт'
        verbose_name_plural = 'Счета'


class InvoiceOption(models.Model):
    invoice = models.ForeignKey(Invoice, related_name='options', verbose_name='Счёт')
    option = models.ForeignKey('promo.Option', verbose_name='Опция')

    value = models.IntegerField(verbose_name='Количество')
    price = models.IntegerField(verbose_name='Цена')

    class Meta:
        verbose_name = 'Опция в счёте'
        verbose_name_plural = 'Опции в счёте'
