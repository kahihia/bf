from rest_framework import viewsets
from libs.api.permissions import IsAdmin, IsAuthenticated, ReadOnly

from .serializers import Category, CategorySerializer


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated & IsAdmin | ReadOnly]
