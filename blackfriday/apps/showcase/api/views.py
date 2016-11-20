from rest_framework import mixins, viewsets, generics, views
from rest_framework.decorators import list_route, detail_route
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, MethodNotAllowed

from libs.api.permissions import IsAdmin, IsAuthenticated

from apps.catalog.models import Category
from apps.advertisers.models import Merchant

from apps.showcase.renderers import *


class StaticGeneratorViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated, IsAdmin]

    @list_route(methods=['post', 'options'])
    def main(self, request, *args, **kwargs):
        if request.method == 'OPTIONS':
            raise MethodNotAllowed(request.method)
        render_main()
        return Response()

    @list_route(methods=['post', 'options'])
    def actions(self, request, *args, **kwargs):
        if request.method == 'OPTIONS':
            raise MethodNotAllowed(request.method)
        render_actions()
        return Response()

    @list_route(methods=['post', 'options'], url_path='all-merchants')
    def all_merchants(self, request, *args, **kwargs):
        if request.method == 'OPTIONS':
            raise MethodNotAllowed(request.method)
        render_all_merchants()
        return Response()

    @list_route(methods=['post', 'options'])
    def partners(self, request, *args, **kwargs):
        if request.method == 'OPTIONS':
            raise MethodNotAllowed(request.method)
        render_partners()
        return Response()

    @list_route(methods=['post', 'options'])
    def russiangoods(self, request, *args, **kwargs):
        if request.method == 'OPTIONS':
            raise MethodNotAllowed(request.method)
        render_russiangoods()
        return Response()

    @list_route(methods=['post', 'options'], url_path='all-pages')
    def all_pages(self, request, *args, **kwargs):
        if request.method == 'OPTIONS':
            raise MethodNotAllowed(request.method)
        render_all_pages()
        return Response()


class StaticGeneratorCategoriesView(views.APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, pk, *args, **kwargs):
        try:
            Category.objects.all().get(pk=pk)
        except:
            raise NotFound

        render_category(pk)
        return Response()


class StaticGeneratorRussianCategoriesView(views.APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, pk, *args, **kwargs):
        try:
            Category.objects.russians().get(pk=pk)
        except:
            raise NotFound

        render_russian_category(pk)
        return Response()


class StaticGeneratorMerchantView(views.APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, pk, *args, **kwargs):
        try:
            Merchant.objects.all().get(pk=pk)
        except:
            raise NotFound

        render_merchant(pk)
        return Response()
