from bulk_update.helper import bulk_update
from rest_framework.decorators import list_route
from rest_framework.viewsets import ModelViewSet, GenericViewSet
from rest_framework import mixins
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError, MethodNotAllowed

from libs.api.exceptions import BadRequest
from libs.api.permissions import IsAuthenticated, IsAdmin

from ..models import LandingLogo
from .serializers import LandingLogoSerializer
from ..utils import render_landing
from ..exceptions import NoContent


class LandingLogoViewSet(ModelViewSet):
    queryset = LandingLogo.objects.filter(position__gte=0).order_by('position')
    serializer_class = LandingLogoSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    @list_route(methods=['post'])
    def reorder(self, request, *args, **kwargs):
        try:
            new_order = list(map(int, request.data))
        except (TypeError, ValueError):
            raise BadRequest('Неверный формат запроса')

        logos = LandingLogo.objects.all().order_by('position')

        new_order_set, old_order_set = set(new_order), set(logo.id for logo in logos)

        if old_order_set - new_order_set:
            raise BadRequest('Не все идентификаторы переданы')

        if new_order_set - old_order_set:
            raise BadRequest('Присутствуют лишние идентификаторы')

        if len(new_order_set) != len(new_order):
            raise BadRequest('В сортировке присутствуют повторы')

        order_dict = dict(map(reversed, enumerate(new_order, start=1)))
        logos_to_update = []

        for logo in logos:
            new_position = order_dict.get(logo.id)
            if new_position and logo.position != new_position:
                logo.position = new_position
                logos_to_update.append(logo)

        if logos_to_update:
            bulk_update(logos_to_update, update_fields=['position'])
        return self.list(request, *args, **kwargs)


class StaticGeneratorViewSet(GenericViewSet):
    permission_classes = [IsAuthenticated, IsAdmin]

    @list_route(methods=['post', 'options'])
    def landing(self, request, *args, **kwargs):
        if request.method == 'OPTIONS':
            raise MethodNotAllowed(request.method)

        try:
            render_landing()
        except NoContent:
            raise ValidationError('no banners and logos available')
        return Response(status=200)
