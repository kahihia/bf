import requests
import logging

from django.db import models, transaction
from django.conf import settings
from django.core.urlresolvers import reverse

from libs.api.exceptions import ServiceUnavailable


logger = logging.getLogger(__name__)


class PaymentServiceEndpoint:
    create = 'create'
    status = 'check_status'


class PaymentServiceStatus:
    success = 'HELD'


class Payment(models.Model):
    _message = None
    _status = None

    _form_url = None
    auth = requests.auth.HTTPBasicAuth(settings.PAYMENT_SERVICE['login'], settings.PAYMENT_SERVICE['password'])

    external_id = models.IntegerField(null=True)
    invoice = models.OneToOneField('orders.Invoice')

    def __str__(self):
        return str(self.invoice_id)

    def build_url(self, endpoint):
        return '{url}{module}/{endpoint}/{pk}?requestor={requestor}'.format(
            **settings.PAYMENT_SERVICE, endpoint=endpoint, pk=self.invoice_id,
        )

    def get_remote_data(self):
        try:
            response = requests.get(
                self.build_url(PaymentServiceEndpoint.status),
                auth=self.auth
            )
            self._status = response.json()['status']
            self._message = response.json()['message']
        except Exception as e:
            logger.error(str(e))
            raise ServiceUnavailable

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

    @property
    def form_url(self):
        return self._form_url

    @property
    def is_successfull(self):
        return self.status == PaymentServiceStatus.success

    def create(self):
        try:
            response = requests.post(
                self.build_url(PaymentServiceEndpoint.create),
                data={
                    'total_price': self.invoice.sum,
                    'return_url': reverse(settings.PAYMENT_SERVICE['redirect_url'], args=(self.pk,))
                },
                auth=self.auth
            )
            self._form_url = response.json()['extra']['formUrl']
            self.external_id = response.json()['order_id']
            self.save()
        except Exception as e:
            logger.error(str(e))
            raise ServiceUnavailable

    @transaction.atomic
    def save(self, *args, **kwargs):
        created = not bool(self.pk)
        super().save(*args, **kwargs)
        if created:
            self.create()

    @property
    def owner_id(self):
        return self.invoice.merchant.advertiser_id
