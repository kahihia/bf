from rest_framework import viewsets

from libs.api.permissions import IsAdmin, IsAuthenticated, action_permission, IsAdvertiser

from .serializers import SpecialSerializer
from apps.specials.models import Special


class SpecialViewSet(viewsets.ModelViewSet):
    queryset = Special.objects.all()
    serializer_class = SpecialSerializer
    permission_classes = [
        IsAuthenticated, IsAdmin | IsAdvertiser & action_permission('list', 'retrieve')]
