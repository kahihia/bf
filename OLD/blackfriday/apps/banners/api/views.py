from rest_framework import viewsets
from libs.api.permissions import ReadOnly, IsAuthenticated, IsAdmin

from .serializers import Partner, PartnerSerializer


class PartnerViewSet(viewsets.ModelViewSet):
    queryset = Partner.objects.all()
    serializer_class = PartnerSerializer
    permission_classes = [IsAuthenticated, ReadOnly | IsAdmin]
