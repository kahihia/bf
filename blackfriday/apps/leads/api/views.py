from rest_framework import viewsets, mixins

from libs.api.permissions import action_permission, IsAuthenticated, IsManager, IsAdmin
from .serializers import Subscriber, SubscriberSerializer


class SubscribersViewSet(mixins.ListModelMixin, mixins.CreateModelMixin, mixins.DestroyModelMixin,
                         viewsets.GenericViewSet):
    permission_classes = [
        action_permission('create') |
        action_permission('list') & IsAuthenticated & IsManager |
        IsAdmin
    ]
    serializer_class = SubscriberSerializer
    queryset = Subscriber.objects.all()
