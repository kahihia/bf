import json

from rest_framework import viewsets, mixins
from rest_framework.response import Response
from rest_framework.decorators import list_route
from libs.api.permissions import IsAdmin, IsAuthenticated, ReadOnly, IsAdvertiser, IsOwner
from djangorestframework_camel_case.util import underscoreize

from apps.advertisers.models import Merchant

from .serializers import Category, CategorySerializer, ProductSerializer
from ..verifier import FeedParser
from ..models import Product


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated & IsAdmin | ReadOnly]


class ProductViewSet(
        mixins.UpdateModelMixin, mixins.RetrieveModelMixin, mixins.ListModelMixin,
        mixins.CreateModelMixin, mixins.DestroyModelMixin, viewsets.GenericViewSet):
    queryset = Product.objects.all()
    permission_classes = [IsAuthenticated, IsAdvertiser & IsOwner | IsAdmin]
    serializer_class = ProductSerializer

    def dispatch(self, request, *args, **kwargs):
        self.merchant = Merchant.objects.get(id=kwargs.get('merchant_pk'))
        return super().dispatch(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        self.queryset.filter(merchant_id=self.merchant.id).delete()
        return Response(status=204)

    def create(self, request, *args, **kwargs):
        data = json.loads(request.body.decode())
        if not isinstance(data, list):
            return Response({'message': 'list of objects required'}, 400)
        result = []
        failed = False
        for row in data:
            cleaned_data, errors, warnings = FeedParser().parse_feed(row)
            if errors and not failed:
                failed = True
            result.append({
                '_id': row.get('_id'),
                'data': cleaned_data,
                'errors': errors,
                'warnings': warnings,
            })
        if failed:
            return Response(result, 400)
        options = []
        categories = {cat.name: cat.id for cat in Category.objects.all()}
        for _row in result:
            row = _row['data']
            row['category_id'] = categories[row.pop('category')]
            row['merchant_id'] = self.merchant.id
            options.append(row)
        qs = [Product(**row) for row in options]
        Product.objects.bulk_create(qs)
        return Response(ProductSerializer(qs, many=True).data, 201)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()

        data = underscoreize(json.loads(request.body.decode()))
        cleaned_data, errors, warnings = FeedParser().parse_feed(data)
        result = {
            'id': instance.id,
            'data': cleaned_data,
            'errors': errors,
            'warnings': warnings,
        }
        if errors:
            return Response(result, 400)
        data['category'] = Category.objects.get(name=data.get('category'))
        serializer = self.get_serializer(instance, data=cleaned_data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @list_route(['POST'])
    def parse(self, request):
        f = request.FILES.get('file')
        if f is None:
            return Response({'message': 'file is required'}, 400)
        result = []
        for counter, row in enumerate(FeedParser(f)):
            cleaned_data, errors, warnings = row
            result.append({
                '_id': counter,
                'data': cleaned_data,
                'warnings': warnings,
                'errors': errors,
            })
        return Response(result, 200)

    @list_route(['POST'])
    def product_feed_verify(self, request):
        data = json.loads(request.body.decode())
        if not isinstance(data, list):
            return Response({'message': 'list of objects required'}, 400)
        result = []
        for row in data:
            # in this case we get data from frontend, it could be parsed data on client side,
            # so we need save given identifiers
            cleaned_data, errors, warnings = FeedParser.parse_feed(row)
            result.append({
                '_id': row.get('_id'),
                'data': cleaned_data,
                'errors': errors,
                'warnings': warnings,
            })
        return Response(result, 200)
