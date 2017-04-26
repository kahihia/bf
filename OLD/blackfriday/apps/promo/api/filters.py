from django_filters import filterset, filters, widgets

from ..models import Option, Promo


class OptionFilter(filterset.FilterSet):
    is_required = filters.BooleanFilter(widget=widgets.BooleanWidget)

    class Meta:
        model = Option
        fields = ['is_required']


class PromoFilter(filterset.FilterSet):
    is_custom = filters.BooleanFilter(widget=widgets.BooleanWidget)

    class Meta:
        model = Promo
        fields = ['is_custom']
