from rest_framework import viewsets
from rest_framework.views import ApiView
from rest_framework.response import Response
from libs.api.permissions import IsAdmin, IsAuthenticated, ReadOnly

from .serializers import Category, CategorySerializer


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated & IsAdmin | ReadOnly]


class ProductsVerification(ApiView):
    def post(self, request):
        import ipdb; ipdb.set_trace()  # breakpoint 97b558c1 //
