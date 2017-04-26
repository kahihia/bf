from django.db.models import Q

from django_filters import filterset, filters

from apps.advertisers.models import Merchant
from ..models import Category


class CategoryFilter(filterset.FilterSet):
    available_to_merchant = filters.MethodFilter(action='filter_available_to_merchant')

    class Meta:
        model = Category
        fields = ['available_to_merchant']

    def filter_available_to_merchant(self, qs, value):
        try:
            return qs.filter(Q(merchant__isnull=True) | Q(merchant=Merchant.objects.get(id=value)))
        except (ValueError, TypeError, Merchant.DoesNotExist):
            return qs.none()
