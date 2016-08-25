from rest_framework import viewsets, mixins

from libs.api.permissions import ReadOnly, IsAuthenticated, IsAdmin

from .filters import OptionFilter, PromoFilter
from .serializers import (Option, OptionSerializer,
                          Promo, PromoSerializer)


class OptionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Option.objects.all()
    serializer_class = OptionSerializer
    filter_class = OptionFilter


class PromoViewSet(mixins.CreateModelMixin, viewsets.ReadOnlyModelViewSet):
    permission_classes = [ReadOnly | IsAuthenticated & IsAdmin]
    queryset = Promo.objects.all()
    serializer_class = PromoSerializer
    filter_class = PromoFilter
