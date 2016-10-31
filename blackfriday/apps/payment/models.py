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


class PaymentServiceStatus:
    success = 'HELD'


class Payment(models.Model):
    _message = None
    _status = None

    form_url = None

    external_id = models.CharField(null=True, blank=True, max_length=255)
    invoice = models.OneToOneField('orders.Invoice')

    def __str__(self):
        return str(self.invoice_id)

    def get_remote_data(self):
        try:
            response = payment_service.status(order_id=self.external_id)
            self._status = response['ErrorCode']
            self._message = response['ErrorMessage']
        except SberRequestError as e:
            self._status = e.code
            self._message = e.desc

    @property
    def status(self):
        if self._status is None:
            self.get_remote_data()
        return self._status

    @property
    def message(self):
        if self._message is None:
            self.get_remote_data()
        return self._message

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
