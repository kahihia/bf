from smtplib import SMTPException

from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.urls import reverse

from rest_framework import mixins
from rest_framework import viewsets
from rest_framework.decorators import detail_route
from rest_framework.response import Response

from libs.api.exceptions import ServiceUnavailable
from libs.api.permissions import IsAdmin, IsAuthenticated

from ..models import Token, TokenType
from .serializers import User, UserSerializer, UserUpdateSerializer, RegistrationSerializer


def send_verification(request, user):
    Token.invalidate(user)
    token = Token.create(user, type=TokenType.VERIFICATION, ttl=settings.VERIFICATION_TTL_HOURS)

    message = render_to_string(
        'users/messages/verification.txt',
        context={
            'user': user,
            'token': token,
            'host': request.get_host(),
            'path': reverse('users:verification'),
            'scheme': request.scheme,
            'hours': '{} час{}'.format(
                settings.VERIFICATION_TTL_HOURS,
                'а' if settings.VERIFICATION_TTL_HOURS % 10 == 1 else 'ов'
            )
        }
    )

    try:
        send_mail(message=message, recipient_list=[user.email], **settings.VERIFICATION)
    except SMTPException:
        raise ServiceUnavailable('Ошибка отправки почты')


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
        send_verification(request, instance)
        return Response(self.get_serializer(instance).data)


class RegistrationViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = User.objects.all()
    serializer_class = RegistrationSerializer

    def perform_create(self, serializer):
        instance = serializer.save()
        send_verification(self.request, instance)
