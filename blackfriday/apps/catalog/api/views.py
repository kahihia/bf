import json
import datetime
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import viewsets, mixins
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import list_route
from rest_framework.exceptions import ValidationError
from jsonschema import validate, ValidationError as JsonSchemaValidationError

from libs.api.permissions import IsAdmin, IsAuthenticated, ReadOnly, IsAdvertiser, IsOwner
from libs.api.exceptions import BadRequest

from apps.promo.models import Option
from apps.advertisers.models import Merchant, ModerationStatus

from .serializers import Category, CategorySerializer, ProductSerializer
from apps.catalog.feeds.verifier import FeedParser
from apps.catalog.feeds.generator import FeedGenerator
from ..models import Product


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated & IsAdmin | ReadOnly]

    def perform_create(self, serializer):
        super().perform_create(serializer)
        Option.calculate_restrictions()

    def perform_destroy(self, instance):
        super().perform_destroy(instance)
        Option.calculate_restrictions()


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

    def validate_schema(self, data, in_list=True):
        item = {
            'type': 'object',
            'properties': {
                'category': {'type': ['string', 'null']},
                'name': {'type': ['string', 'null']},
                'image': {'type': ['string', 'null']},
                'price': {'type': ['number', 'string', 'null']},
                'start_price': {'type': ['number', 'string', 'null']},
                'old_price': {'type': ['number', 'string', 'null']},
                'discount': {'type': ['number', 'string', 'null']},
                'country': {'type': ['string', 'null']},
                'brand': {'type': ['string', 'null']},
                'url': {'type': ['string', 'null']},
                'currency': {'type': ['string', 'null']},
                'is_teaser': {'type': 'boolean'},
                'is_teaser_on_main': {'type': 'boolean'},
            }
        }
        schema = {'type': 'array', 'items': item} if in_list else item
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
        self.validate_schema(request.data, in_list=False)
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
            raise BadRequest('file is required')
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


class YmlProductViewSet(viewsets.GenericViewSet):
    @list_route(['get'])
    def yml(self, request, **kwargs):
        include_category_ids = request.GET.getlist('categories', [])
        include_merchants_id = request.GET.getlist('merchants', [])

        categories = Category.objects.filter(
            **({'id__in': include_category_ids} if include_category_ids else {})
        ).exclude(
            id__in=request.GET.getlist('exclude_categories', [])
        )
        merchants = Merchant.objects.filter(
            **({'id__in': include_merchants_id} if include_merchants_id else {})
        ).exclude(
            id__in=request.GET.getlist('exclude_merchants', [])
        )
        products = Product.objects.filter(
            merchant__in=merchants, category__in=categories, merchant__moderation_status=ModerationStatus.confirmed)

        controls = {
            'utm': {
                'utm_source': request.GET.get('utm_source'),
                'utm_medium': request.GET.get('utm_medium'),
                'utm_campaign': request.GET.get('utm_campaign'),
            },
            'excludes': request.GET.getlist('excludes', []),
            'url_bindings': {
                'url_cat': request.GET.get('bind_url_cat', 'url_cat'),
                'url_shop': request.GET.get('bind_url_shop', 'url_shop'),
                'url': request.GET.get('bind_url', 'url'),
            },
            'show_teaser_cat': json.loads(request.GET.get('show_teaser_cat', 'false'))
        }
        filename = request.GET.get(
            'filename', 'blackfriday feed {}'.format(
                datetime.datetime.strftime(timezone.now(), '%d-%m-%Y %H:%M')))

        yml = FeedGenerator(controls).generate(products, categories)
        response = HttpResponse(content_type='application/xml')
        yml.write(response)
        response['Content-Disposition'] = 'attachment; filename="{}.xml"'.format(filename)
        return response
