from django_filters import filterset, filters
from django_filters.widgets import BooleanWidget

from apps.users.models import User

from ..models import Merchant, AdvertiserType


class AdvertiserFilter(filterset.FilterSet):
    q = filters.CharFilter(name='name', lookup_expr='icontains')

    class Meta:
        model = User
        fields = ['q']


class MerchantFilter(filterset.FilterSet):
    moderation_status = filters.ChoiceFilter(choices=Merchant.MODERATION_STATUSES)
    exclude_supernova = filters.MethodFilter(action='filter_exclude_supernova', widget=BooleanWidget())

    class Meta:
        model = Merchant
        fields = ['moderation_status']

    def filter_exclude_supernova(self, qs, value):
        if value:
            qs = qs.exclude(advertiser__profile__type=AdvertiserType.SUPERNOVA)
        return qs
