import json

from rest_framework import viewsets, mixins
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import list_route
from djangorestframework_camel_case.util import underscoreize

from libs.api.permissions import IsAdmin, IsAuthenticated, ReadOnly, IsAdvertiser, IsOwner
from libs.api.exceptions import BadResponse

from apps.advertisers.models import Merchant

from .serializers import Category, CategorySerializer, ProductSerializer
from ..verifier import FeedParser
from ..models import Product


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated & IsAdmin | ReadOnly]


class ProductViewSet(
        mixins.RetrieveModelMixin, mixins.ListModelMixin,
        mixins.DestroyModelMixin, viewsets.GenericViewSet):
    queryset = Product.objects.all()
    permission_classes = [IsAuthenticated, IsAdvertiser & IsOwner | IsAdmin]
    serializer_class = ProductSerializer

    def dispatch(self, request, *args, **kwargs):
        self.merchant = Merchant.objects.get(id=kwargs.get('merchant_pk'))
        self.feed_data = underscoreize(json.loads(request.body.decode()))
        return super().dispatch(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        self.queryset.filter(merchant_id=self.merchant.id).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def create(self, request, *args, **kwargs):

        if not isinstance(self.feed_data, list):
            raise BadResponse('list of objects required')
        result = []
        failed = False
        for row in self.feed_data:
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
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        categories = {cat.name: cat.id for cat in Category.objects.all()}
        qs = [
            Product(
                **dict(
                    row['data'],
                    **{
                        'category_id': categories[row['data'].pop('category')],
                        'merchant_id': self.merchant.id
                    }
                )
            ) for row in result
        ]
        Product.objects.bulk_create(qs)
        return Response(self.get_serializer(qs, many=True).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        cleaned_data, errors, warnings = FeedParser().parse_feed(self.feed_data)
        result = {
            'id': instance.id,
            'data': cleaned_data,
            'errors': errors,
            'warnings': warnings,
        }

        if errors:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        data = dict(
            cleaned_data,
            **{
                'category': Category.objects.get(name=cleaned_data.get('category')),
                'is_teaser': self.feed_data.get('is_teaser', False),
                'is_teaser_on_main': self.feed_data.get('is_teaser_on_main', False),
            }
        )
        for field, value in data.items():
            setattr(instance, field, value)

        instance.save()

        return Response(self.get_serializer(instance).data)

    @list_route(['POST'])
    def parse(self, request, **kwargs):
        f = request.FILES.get('file')
        if f is None:
            raise BadResponse('file is required')
        result = []
        for counter, row in enumerate(FeedParser(f)):
            cleaned_data, errors, warnings = row
            result.append({
                '_id': counter,
                'data': cleaned_data,
                'warnings': warnings,
                'errors': errors,
            })
        return Response(result)

    @list_route(['POST'])
    def verify(self, request, **kwargs):
        if not isinstance(self.feed_data, list):
            raise BadResponse('list of objects required')
        result = []
        for row in self.feed_data:
            # in this case we get data from frontend, it could be parsed data on client side,
            # so we need save given identifiers
            cleaned_data, errors, warnings = FeedParser().parse_feed(row)
            result.append({
                '_id': row.get('_id'),
                'data': cleaned_data,
                'errors': errors,
                'warnings': warnings,
            })
        return Response(result)
