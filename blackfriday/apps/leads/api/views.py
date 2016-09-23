from rest_framework import viewsets, mixins, status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied

from libs.api.permissions import action_permission, IsAuthenticated, IsManager, IsAdmin, IsOperator
from .serializers import (Subscriber, SubscriberSerializer,
                          AdvertiserRequest, AdvertiserRequestSerializer, AdvertiserRequestStatusSerializer)


class SubscribersViewSet(mixins.ListModelMixin, mixins.CreateModelMixin, mixins.DestroyModelMixin,
                         viewsets.GenericViewSet):
    permission_classes = [
        action_permission('create') |
        action_permission('list') & IsAuthenticated & IsManager |
        IsAuthenticated & IsAdmin
    ]
    serializer_class = SubscriberSerializer
    queryset = Subscriber.objects.all()

    def create(self, request, *args, **kwargs):
        subscriber = Subscriber.objects.filter(email=request.data.get('email')).first()
        serializer = self.get_serializer(instance=subscriber, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK if subscriber else status.HTTP_201_CREATED)


class AdvertiserRequestsViewSet(viewsets.ModelViewSet):
    queryset = AdvertiserRequest.objects.all()
    permission_classes = [
        action_permission('create') |
        action_permission('list', 'update', 'partial_update') & IsAuthenticated & IsManager |
        IsAuthenticated & (IsAdmin | IsOperator)
    ]

    def get_serializer_class(self):
        if 'update' in self.action:
            return AdvertiserRequestStatusSerializer
        return AdvertiserRequestSerializer

    def create(self, request, *args, **kwargs):
        advertiser_request = AdvertiserRequest.objects.filter(email=request.data.get('email')).first()
        serializer = self.get_serializer(instance=advertiser_request, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK if advertiser_request else status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if (
            instance.user_responsible and
            instance.user_responsible_id != request.user.id and
            request.user.role != 'admin'
        ):
            raise PermissionDenied
        return super().update(request, *args, **kwargs)
