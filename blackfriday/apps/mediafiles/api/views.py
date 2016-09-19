from rest_framework import viewsets
from libs.api.permissions import IsAuthenticated

from .serializers import ImageSerializer
from ..models import Image


class ImageViewSet(viewsets.ModelViewSet):
    queryset = Image.objects.all()
    serializer_class = ImageSerializer
    permission_classes = [IsAuthenticated]
