from rest_framework import viewsets, mixins
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import list_route
from rest_framework.exceptions import ValidationError
from jsonschema import validate, ValidationError as JsonSchemaValidationError

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
        return super().dispatch(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        self.queryset.filter(merchant_id=self.merchant.id).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def validate_schema(self, data):
        schema = {
            'type': 'array',
            'items': {
                'type': 'object',
                'properties': {
                    'category': {'type': 'string'},
                    'name': {'type': 'string'},
                    'image': {'type': 'string'},
                    'price': {'type': 'number'},
                    'start_price': {'type': 'number'},
                    'old_price': {'type': 'number'},
                    'discount': {'type': 'number'},
                    'country': {'type': 'string'},
                    'brand': {'type': 'string'},
                    'url': {'type': 'string'},
                    'currency': {'type': 'string'},
                    'is_teaser': {'type': 'boolean'},
                    'is_teaser_on_main': {'type': 'boolean'},
                }
            }
        }
        try:
            validate(data, schema)
        except JsonSchemaValidationError:
            raise ValidationError('invalid schema')

    def create(self, request, *args, **kwargs):
        self.validate_schema(request.data)
        result = []
        failed = False
        for row in request.data:
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
        self.validate_schema(request.data)
        instance = self.get_object()
        cleaned_data, errors, warnings = FeedParser().parse_feed(request.data)
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
                'is_teaser': request.data.get('is_teaser', False),
                'is_teaser_on_main': request.data.get('is_teaser_on_main', False),
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
        self.validate_schema(request.data)
        if not isinstance(request.data, list):
            raise BadResponse('list of objects required')
        result = []
        for row in request.data:
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
