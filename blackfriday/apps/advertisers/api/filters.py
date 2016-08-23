from django_filters import filterset, filters

from .serializers import User


class AdvertiserFilter(filterset.FilterSet):
    strict = filterset.STRICTNESS.RAISE_VALIDATION_ERROR

    q = filters.CharFilter(name='name', lookup_expr='icontains')

    class Meta:
        model = User
        fields = ['q']
