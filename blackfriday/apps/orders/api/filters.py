from datetime import datetime

from django_filters import filterset, filters
from django_filters.widgets import BooleanWidget

from apps.advertisers.models import AdvertiserType
from apps.users.models import User

from ..models import Invoice, InvoiceStatus


class InvoiceFilter(filterset.FilterSet):
    advertiser = filters.ModelChoiceFilter(name='merchant__advertiser',
                                           queryset=User.objects.filter(profile__isnull=False))
    date = filters.DateFilter(name='created_datetime', lookup_expr='date')

    min_sum = filters.NumberFilter(name='sum', lookup_expr='gte')
    max_sum = filters.NumberFilter(name='sum', lookup_expr='lte')

    status = filters.MethodFilter(action='filter_status')
    exclude_supernova = filters.MethodFilter(action='filter_exclude_supernova', widget=BooleanWidget())

    class Meta:
        model = Invoice
        fields = ['date', 'advertiser', 'id', 'min_sum', 'max_sum', 'status']

    def filter_exclude_supernova(self, qs, value):
        if value:
            qs = qs.exclude(merchant__advertiser__profile__type=AdvertiserType.SUPERNOVA)
        return qs

    def filter_status(self, qs, value):
        try:
            value = int(value)
        except ValueError:
            pass

        if value == InvoiceStatus.paid:
            return qs.filter(is_paid=True)
        if value == InvoiceStatus.cancelled:
            return qs.filter(expired_datetime__lte=datetime.now(), is_paid=False)
        if value == InvoiceStatus.new:
            return qs.filter(expired_datetime__gt=datetime.now(), is_paid=False)

        return qs.none()
