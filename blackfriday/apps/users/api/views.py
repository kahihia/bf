from smtplib import SMTPException

from rest_framework import viewsets
from rest_framework.decorators import detail_route
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from libs.api.exceptions import ServiceUnavailable
from libs.api.permissions import IsAdmin

from .serializers import User, UserSerializer, UserUpdateSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    permission_classes = [IsAuthenticated, IsAdmin]

    def get_serializer_class(self):
        if 'update' in self.action:
            return UserUpdateSerializer
        return self.serializer_class

    @detail_route(methods=['post'])
    def verification(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            instance.send_verification()
        except SMTPException:
            raise ServiceUnavailable('Ошибка отправки почты')
        return Response(self.get_serializer(instance).data)
