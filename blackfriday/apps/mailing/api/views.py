from rest_framework import viewsets
from rest_framework.decorators import list_route
from rest_framework.renderers import TemplateHTMLRenderer
from rest_framework.response import Response

from libs.api.permissions import IsAuthenticated, IsAdmin

from .serializers import LogoMailingSerializer


class MailingViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_serializer_class(self):
        return LogoMailingSerializer

    @list_route(methods=['get'], renderer_classes=[TemplateHTMLRenderer])
    def banners(self, request, *args, **kwargs):
        return Response({}, template_name='mailing/api/mailing.html')

    @list_route(methods=['post'], renderer_classes=[TemplateHTMLRenderer])
    def logos(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data, template_name='mailing/api/mailing.html')
