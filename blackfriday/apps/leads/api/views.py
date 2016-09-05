from rest_framework import viewsets, mixins, status
from rest_framework.response import Response

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

    def create(self, request, *args, **kwargs):
        subscriber = Subscriber.objects.filter(email=request.data.get('email')).first()
        serializer = self.get_serializer(instance=subscriber, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK if subscriber else status.HTTP_201_CREATED)
