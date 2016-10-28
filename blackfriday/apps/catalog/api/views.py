import json
import datetime

from django.db.models import Q
from django.http import HttpResponse
from django.conf import settings
from django.utils import timezone
from django.http.response import BadHeaderError

from jsonschema import validate, ValidationError as JsonSchemaValidationError

from rest_framework import viewsets, mixins, status
from rest_framework.response import Response
from rest_framework.decorators import list_route
from rest_framework.exceptions import ValidationError
from rest_framework.generics import get_object_or_404

from libs.api.exceptions import BadRequest
from libs.api.permissions import IsAdmin, IsAuthenticated, ReadOnly, IsAdvertiser, IsOwner

from apps.advertisers.models import Merchant, ModerationStatus
from ..models import Product, Category

from ..feeds.verifier import FeedParser
from ..feeds.generator import FeedGenerator

from .filters import CategoryFilter
from .serializers import CategorySerializer, ProductSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated, IsAdmin | ReadOnly]
    filter_class = CategoryFilter

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.user.role == 'advertiser':
            qs = qs.filter(Q(merchant__isnull=True) | Q(merchant__advertiser=self.request.user))
        return qs


class ProductViewSet(
        mixins.RetrieveModelMixin, mixins.ListModelMixin,
        mixins.DestroyModelMixin, viewsets.GenericViewSet):
    queryset = Product.objects.all()
    permission_classes = [IsAuthenticated, IsAdvertiser & IsOwner | IsAdmin]
    serializer_class = ProductSerializer

    def get_queryset(self):
        return super().get_queryset().filter(merchant=self.get_merchant())

    def get_merchant(self):
        return get_object_or_404(Merchant, pk=self.kwargs.get('merchant_pk'))

    def delete(self, request, *args, **kwargs):
        self.queryset.filter(merchant=self.get_merchant()).delete()
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
            raise ValidationError({'detail': 'invalid schema'})

    def create(self, request, *args, **kwargs):
        merchant = self.get_merchant()
        self.validate_schema(request.data)
        result = []
        failed = False
        for row in request.data:
            cleaned_data, errors, warnings = FeedParser(merchant_id=self.get_merchant().id).parse_feed(row)
            if errors and not failed:
                failed = True
            result.append({
                'data': cleaned_data,
                'errors': errors,
                'warnings': warnings,
            })
        if failed:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        if len(result) + merchant.products.count() > merchant.limits['products']:
            raise ValidationError({'detail': 'out_of_limit'})

        cat_qs = Category.objects.all()
        if request.user.role == 'advertiser':
            cat_qs = cat_qs.filter(Q(merchant__isnull=True) | Q(merchant__advertiser=self.request.user))
        categories = {cat.name.lower(): cat.id for cat in cat_qs}
        qs = [
            Product(
                category_id=categories[str.lower(row['data'].get('category', settings.DEFAULT_CATEGORY_NAME))],
                merchant=merchant,
                **{key: value for key, value in row['data'].items() if key not in ['category', '_id']},
            ) for row in result
        ]
        Product.objects.bulk_create(qs)
        return Response(self.get_serializer(qs, many=True).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        self.validate_schema(request.data, in_list=False)
        instance = self.get_object()
        cleaned_data, errors, warnings = FeedParser(
            merchant_id=self.get_merchant().id,
            _id_required=False
        ).parse_feed(request.data)
        result = {
            'id': instance.id,
            'data': cleaned_data,
            'errors': errors,
            'warnings': warnings,
        }

        if errors:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        cleaned_data.pop('_id')

        cat_qs = Category.objects.all()
        if request.user.role == 'advertiser':
            cat_qs = cat_qs.filter(Q(merchant__isnull=True) | Q(merchant__advertiser=self.request.user))

        data = dict(
            cleaned_data,
            **{
                'category': cat_qs.get(name__iexact=cleaned_data.get('category')),
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
        for counter, row in enumerate(FeedParser(f, merchant_id=self.get_merchant().id)):
            cleaned_data, errors, warnings = row
            result.append({
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
            cleaned_data, errors, warnings = FeedParser(merchant_id=self.get_merchant().id).parse_feed(row)
            result.append({
                'data': cleaned_data,
                'errors': errors,
                'warnings': warnings,
            })
        return Response(result)


class YmlProductViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated, IsAdmin]

    @list_route(['get'])
    def yml(self, request, **kwargs):
        include_category_ids = list(filter(str.isdigit, request.GET.getlist('categories', [])))
        include_merchants_id = list(filter(str.isdigit, request.GET.getlist('merchants', [])))

        cat_qs = Category.objects.all()
        if request.user.role == 'advertiser':
            cat_qs = cat_qs.filter(Q(merchant__isnull=True) | Q(merchant__advertiser=self.request.user))

        categories = cat_qs.filter(
            **({'id__in': include_category_ids} if include_category_ids else {})
        ).exclude(
            id__in=filter(str.isdigit, request.GET.getlist('exclude_categories', []))
        )
        merchants = Merchant.objects.filter(
            **({'id__in': include_merchants_id} if include_merchants_id else {})
        ).exclude(
            id__in=filter(str.isdigit, request.GET.getlist('exclude_merchants', []))
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
                'url_cat': request.GET.get('bind_url_cat'),
                'url_shop': request.GET.get('bind_url_shop', 'url_shop'),
                'url': request.GET.get('bind_url', 'url'),
            },
            'show_teaser_cat': json.loads(request.GET.get('show_teaser_cat', 'false'))
        }

        yml = FeedGenerator(controls).generate(products, categories)
        response = HttpResponse(content_type='application/xml')
        yml.write(response, xml_declaration=True, method='xml', encoding='utf-8')
        try:
            response['Content-Disposition'] = 'attachment; filename="{}.xml"'.format(request.GET['filename'])
        except (BadHeaderError, KeyError) as e:
            response['Content-Disposition'] = 'attachment; filename="{}.xml"'.format(
                'blackfriday feed {}'.format(
                    datetime.datetime.strftime(timezone.now(), '%d-%m-%Y %H:%M')))
        return response
