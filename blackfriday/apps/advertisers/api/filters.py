from django_filters import filterset, filters

from apps.users.models import User

from ..models import Merchant


class AdvertiserFilter(filterset.FilterSet):
    q = filters.CharFilter(name='name', lookup_expr='icontains')

    class Meta:
        model = User
        fields = ['q']


class MerchantFilter(filterset.FilterSet):
    moderation_status = filters.ChoiceFilter(choices=Merchant.MODERATION_STATUSES)

    class Meta:
        model = Merchant
        fields = ['moderation_status']
