import dicttoxml
import requests
from django.conf import settings

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

    def perform_destroy(self, instance):
        requests.delete(
            settings.EXPERT_SENDER_URL + '/Api/Subscribers',
            params={
                'apiKey': settings.EXPERT_SENDER_KEY,
                'listId': settings.EXPERT_SENDER_LIST,
                'email': instance.email
            }
        )
        super().perform_destroy(instance)

    def create(self, request, *args, **kwargs):
        subscriber = Subscriber.objects.filter(email=request.data.get('email')).first()
        serializer = self.get_serializer(instance=subscriber, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        requests.post(
            settings.EXPERT_SENDER_URL + '/Api/Subscribers',
            headers={'Content-Type': 'application/xml'},
            data=dicttoxml.dicttoxml({
                'ApiKey': settings.EXPERT_SENDER_KEY,
                'Data': {
                    'ListId': settings.EXPERT_SENDER_LIST,
                    'Email': serializer.instance.email,
                    'Name': serializer.instance.name
                }
            }, custom_root='ApiRequest', attr_type=False)
        )

        return Response(serializer.data, status=status.HTTP_200_OK if subscriber else status.HTTP_201_CREATED)


class AdvertiserRequestsViewSet(viewsets.ModelViewSet):
    queryset = AdvertiserRequest.objects.all()
    permission_classes = [
        action_permission('create') |
        action_permission('list', 'update', 'partial_update') & IsAuthenticated & IsOperator |
        IsAuthenticated & IsAdmin
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
