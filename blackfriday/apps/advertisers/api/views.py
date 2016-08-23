from rest_framework import mixins, viewsets
from rest_framework.decorators import list_route

from libs.api.permissions import IsAdmin, IsOwner, IsActive, IsAdvertiser

from .filters import AdvertiserFilter
from .serializers import User, AdvertiserSerializer


class AdvertiserViewSet(mixins.UpdateModelMixin, mixins.RetrieveModelMixin,
                        mixins.ListModelMixin, viewsets.GenericViewSet):
    permission_classes = [IsActive, IsOwner | IsAdmin]
    queryset = User.objects.filter(profile__isnull=False, is_active=True)
    serializer_class = AdvertiserSerializer
    filter_class = AdvertiserFilter

    @list_route(methods=['get', 'put', 'patch', 'head', 'options'], permission_classes=[IsActive, IsAdvertiser])
    def current(self, request, *args, **kwargs):
        action_map = {'get': 'retrieve', 'put': 'update', 'patch': 'partial_update'}
        return self.__class__.as_view(action_map)(request, pk=request.user.pk, *args, **kwargs)
