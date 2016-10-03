from logging import getLogger
from smtplib import SMTPException

from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.urls import reverse

from rest_framework import mixins
from rest_framework import viewsets
from rest_framework.decorators import detail_route
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from libs.api.exceptions import ServiceUnavailable
from libs.api.permissions import IsAdmin, IsAuthenticated, IsAdvertiser

from apps.advertisers.api.serializers import AdvertiserSerializer

from ..models import Token, TokenType
from .serializers import User, UserSerializer, UserUpdateSerializer, RegistrationSerializer, SupportRequestSerializer


def send_verification(request, user):
    Token.invalidate(user, type=TokenType.VERIFICATION)
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
        send_mail(subject=settings.VERIFICATION_SUBJ, message=message,
                  recipient_list=[user.email], from_email=settings.DEFAULT_FROM_EMAIL)
    except SMTPException as e:
        logger = getLogger('mailing')
        logger.error(e)
        raise ServiceUnavailable('Ошибка отправки почты')


def send_support_request(request, data):
    send_mail(
        subject='Просьба о помощи от рекламодателя',
        recipient_list=[settings.SUPPORT_EMAIL],
        from_email=settings.DEFAULT_FROM_EMAIL,
        message=render_to_string(
            'users/messages/support.txt',
            {
                'advertiser': request.user,
                **data
            }
        ),
    )


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

    def dispatch(self, request, *args, **kwargs):
        self.token = request.GET.get('token')
        return super().dispatch(request, *args, **kwargs)

    def get_serializer_class(self):
        if self.token is None:
            return RegistrationSerializer
        return AdvertiserSerializer

    def create(self, request, *args, **kwargs):
        if self.token is None:
            return super().create(request, *args, **kwargs)

        token = Token.get_token(self.token, type=TokenType.REGISTRATION)
        if not token or token.is_expired or token.user.role != 'advertiser':
            raise PermissionDenied

        serializer = self.get_serializer(token.user, data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def perform_update(self, serializer):
        instance = serializer.save()
        Token.invalidate(instance, type=TokenType.REGISTRATION)

    def perform_create(self, serializer):
        instance = serializer.save()
        send_verification(self.request, instance)


class SupportRequestViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated, IsAdvertiser]
    serializer_class = SupportRequestSerializer

    def perform_create(self, serializer):
        send_support_request(self.request, serializer.data)
