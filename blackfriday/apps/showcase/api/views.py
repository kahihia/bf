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
        render_main.delay(True)
        return Response()

    @list_route(methods=['post', 'options'])
    def actions(self, request, *args, **kwargs):
        if request.method == 'OPTIONS':
            raise MethodNotAllowed(request.method)
        render_actions.delay(True)
        return Response()

    @list_route(methods=['post', 'options'], url_path='all-merchants')
    def all_merchants(self, request, *args, **kwargs):
        if request.method == 'OPTIONS':
            raise MethodNotAllowed(request.method)
        render_all_merchants.delay(True)
        return Response()

    @list_route(methods=['post', 'options'])
    def partners(self, request, *args, **kwargs):
        if request.method == 'OPTIONS':
            raise MethodNotAllowed(request.method)
        render_partners.delay(True)
        return Response()

    @list_route(methods=['post', 'options'])
    def russiangoods(self, request, *args, **kwargs):
        if request.method == 'OPTIONS':
            raise MethodNotAllowed(request.method)
        render_russiangoods.delay(True)
        return Response()

    @list_route(methods=['post', 'options'])
    def foreigngoods(self, request, *args, **kwargs):
        if request.method == 'OPTIONS':
            raise MethodNotAllowed(request.method)
        render_foreigngoods.delay(True)
        return Response()

    @list_route(methods=['post', 'options'], url_path='all-pages')
    def all_pages(self, request, *args, **kwargs):
        if request.method == 'OPTIONS':
            raise MethodNotAllowed(request.method)
        render_all_pages.delay(True)
        return Response()


class StaticGeneratorCategoriesView(views.APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, pk, *args, **kwargs):
        try:
            Category.objects.all().get(pk=pk)
        except:
            raise NotFound

        render_category.delay(pk, True)
        return Response()


class StaticGeneratorRussianCategoriesView(views.APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, pk, *args, **kwargs):
        try:
            Category.objects.russians().get(pk=pk)
        except:
            raise NotFound

        render_russian_category.delay(pk, True)
        return Response()

class StaticGeneratorForeignCategoriesView(views.APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, pk, *args, **kwargs):
        try:
            Category.objects.russians().get(pk=pk)
        except:
            raise NotFound

        render_foreign_category.delay(pk, True)
        return Response()


class StaticGeneratorMerchantView(views.APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, pk, *args, **kwargs):
        try:
            Merchant.objects.all().get(pk=pk)
        except:
            raise NotFound

        render_merchant.delay(pk, True)
        return Response()
