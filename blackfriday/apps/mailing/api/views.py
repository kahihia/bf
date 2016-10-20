from rest_framework import viewsets
from rest_framework.decorators import list_route
from rest_framework.renderers import TemplateHTMLRenderer
from rest_framework.response import Response

from libs.api.permissions import IsAuthenticated, IsAdmin


class MailingViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated, IsAdmin]

    @list_route(methods=['get'], renderer_classes=[TemplateHTMLRenderer])
    def banners(self, request, *args, **kwargs):
        return Response({}, template_name='mailing/api/mailing.html')

    @list_route(methods=['get'], renderer_classes=[TemplateHTMLRenderer])
    def logos(self, request, *args, **kwargs):
        return Response({}, template_name='mailing/api/mailing.html')
