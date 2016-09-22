from bulk_update.helper import bulk_update
from rest_framework.decorators import list_route
from rest_framework.viewsets import ModelViewSet

from libs.api.exceptions import BadRequest
from libs.api.permissions import IsAuthenticated, IsAdmin

from ..models import LandingLogo
from .serializers import LandingLogoSerializer


class LandingLogoViewSet(ModelViewSet):
    queryset = LandingLogo.objects.filter(position__gte=0).order_by('position')
    serializer_class = LandingLogoSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    @list_route(methods=['post'])
    def reorder(self, request, *args, **kwargs):
        try:
            new_order = list(map(int, request.data))
        except (TypeError, ValueError):
            raise BadRequest

        logos = LandingLogo.objects.all().order_by('position')

        new_order_set, old_order_set = set(new_order), set(logo.id for logo in logos)
        if new_order_set != old_order_set or len(new_order_set) != len(new_order):
            raise BadRequest

        logos_to_update = []
        for logo, position in zip(logos, new_order):
            if logo.position != position:
                logo.position = position
                logos_to_update.append(logo)

        if logos_to_update:
            bulk_update(logos_to_update, update_fields=['position'])
        return self.list(request, *args, **kwargs)
