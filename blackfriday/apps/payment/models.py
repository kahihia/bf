import logging

from pysberbps import SberWrapper, SberRequestError
from django.db import models, transaction
from django.conf import settings
from django.core.urlresolvers import reverse


logger = logging.getLogger(__name__)

payment_service = SberWrapper(
    username=settings.PAYMENT_SERVICE['login'], password=settings.PAYMENT_SERVICE['password']
)


class PaymentServiceEndpoint:
    create = 'create'
    status = 'check_status'


class Payment(models.Model):
    _error_message = None
    _error_status = None
    _order_message = None
    _order_status = None

    ERROR_MESSAGES = {
        '0': 'Обработка запроса прошла без системных ошибок',
        '2': 'Заказ отклонен по причине ошибки в реквизитах платежа',
        '5': 'Доступ запрещён/Пользователь должен сменить свой пароль/[orderId] не указан',
        '6': 'Незарегистрированный OrderId',
        '7': 'Системная ошибка'
    }

    ORDER_MESSAGES = {
        '0': 'Заказ зарегистрирован, но не оплачен',
        '1': 'Предавторизованная сумма захолдирована (для двухстадийных платежей)',
        '2': 'Проведена полная авторизация суммы заказа',
        '3': 'Авторизация отменена',
        '4': 'По транзакции была проведена операция возврата',
        '5': 'Инициирована авторизация через ACS банка-эмитента',
        '6': 'Авторизация отклонена'
    }

    form_url = None

    external_id = models.CharField(null=True, blank=True, max_length=255)
    invoice = models.OneToOneField('orders.Invoice')

    def __str__(self):
        return str(self.invoice_id)

    def get_remote_data(self):
        try:
            response = payment_service.status(order_id=self.external_id)
            self._error_status = response['ErrorCode']
            self._order_status = response['OrderStatus']
        except SberRequestError as e:
            self._error_status = e.code
            self._error_message = e.desc

    @property
    def error_status(self):
        if self._error_status is None:
            self.get_remote_data()
        return self._error_status

    @property
    def error_message(self):
        return Payment.ERROR_MESSAGES[self.error_status]

    @property
    def order_status(self):
        if self._order_status is None:
            self.get_remote_data()
        return self._order_status

    @property
    def order_message(self):
        return Payment.ORDER_MESSAGES.get(self.order_status)

    def create(self):
        self.external_id, self.form_url = payment_service.register(
            order=self.invoice_id, success_url=reverse('payment:finished', args=(self.pk,)),
            amount=self.invoice.sum * 100
        )
        self.save()

    @transaction.atomic
    def save(self, *args, **kwargs):
        created = not bool(self.pk)
        super().save(*args, **kwargs)
        if created:
            self.create()

    @property
    def owner_id(self):
        return self.invoice.merchant.advertiser_id
