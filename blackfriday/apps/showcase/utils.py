import json

from django.template.loader import render_to_string
from django.db.models import *
from django.apps import apps

from rest_framework import serializers

from apps.banners.models import Partner
from apps.advertisers.models import Merchant, Banner
from apps.catalog.models import Product, Category


def serializer_factory(cls_name, fields, **extra_fields):
    return type(
        '{}ContextSerializer'.format(cls_name),
        (serializers.ModelSerializer, ),
        dict(
            **extra_fields,
            **{'Meta': type('Meta', (), {'model': apps.get_model(cls_name), 'fields': fields})}
        )
    )


MerchantSerializer = serializer_factory(
    cls_name='advertisers.Merchant',
    fields=('id', 'name', 'url', 'image'),
    image=serializers.CharField(source='image.image')
)
PartnerSerializer = serializer_factory(
    cls_name='banners.Partner',
    fields=('id', 'name', 'url', 'image'),
    image=serializers.CharField(source='image.image')
)
BannerSerializer = serializer_factory(
    cls_name='advertisers.Banner',
    fields=('id', 'name', 'url', 'merchant'),
    image=serializers.CharField(source='image.image'),
    merchant=MerchantSerializer(),

)
ProductSerializer = serializer_factory(
    cls_name='catalog.Product',
    fields=('id', 'category', 'name', 'price', 'old_price', 'start_price', 'discount', 'merchant', 'url', 'image'),
    merchant=MerchantSerializer(),
)
CategorySerializer = serializer_factory(
    cls_name='catalog.Category',
    fields=('id', 'name', 'url'),
    url=serializers.SerializerMethodField(),
    get_url=lambda self, obj: '/category/{}'.format(obj.slug),
)
SuperbannerSerializer = serializer_factory(
    cls_name='advertisers.Banner',
    fields=('id', 'image', 'url'),
    image=serializers.CharField(source='image.image'),
)


def merchants():
    return render_to_string(
        'showcase/merchants.html',
        {
            'merchants': json.dumps(MerchantSerializer(Merchant.objects.moderated(), many=True).data),
            'superbanners': json.dumps(
                SuperbannerSerializer(
                    Banner.objects.super().from_moderated_merchants().filter(in_mailing=False),
                    many=True
                ).data
            ),
            'teasers': json.dumps(
                ProductSerializer(Product.objects.teasers().from_moderated_merchants(), many=True)),
            'categories': json.dumps(CategorySerializer(Category.objects.all(), many=True).data)
        }
    )


def actions():
    return render_to_string(
        'showcase/actions.html',
        {
            'superbanners': json.dumps(
                SuperbannerSerializer(
                    Banner.objects.super().from_moderated_merchants().filter(in_mailing=False),
                    many=True
                ).data
            ),
            'banners': json.dumps(
                BannerSerializer(Banner.objects.action(), many=True).data),
            'products': json.dumps(
                ProductSerializer(Product.objects.from_moderated_merchants(), many=True).data),
            'teasers': json.dumps(
                ProductSerializer(Product.objects.from_moderated_merchants().teasers(), many=True).data),
            'categories': json.dumps(CategorySerializer(Category.objects.all(), many=True).data)

        }
    )


def main_page():
    background_qs = Merchant.objects.moderated().annotate(
        left=Max(Case(When(banners__type=30, then=F('banners__image__image')), output_field=CharField())),
        right=Max(Case(When(banners__type=40, then=F('banners__image__image')), output_field=CharField()))
    ).values(
        'left', 'right', 'banners__url', 'id'
    ).filter(Q(right__isnull=False) | Q(left__isnull=False))
    backgrounds = {}
    for b in background_qs:
        b_id = b['id']
        if b_id not in backgrounds:
            backgrounds[b_id] = {}
        if b['left']:
            backgrounds[b_id]['left'] = b['left']
        if b['right']:
            backgrounds[b_id]['right'] = b['right']
        backgrounds[b_id]['id'] = b_id
        backgrounds[b_id]['url'] = b['banners__url']

    return render_to_string(
        'showcase/main.html',
        {
            'superbanners': json.dumps(
                SuperbannerSerializer(
                    Banner.objects.super().from_moderated_merchants().filter(on_main=True),
                    many=True
                ).data
            ),
            'merchants': json.dumps(MerchantSerializer(Merchant.objects.moderated(), many=True).data),
            'partners': json.dumps(PartnerSerializer(Partner.objects.all(), many=True).data),
            'banners': json.dumps(BannerSerializer(Banner.objects.from_moderated_merchants(), many=True).data),
            'verticalbanners': json.dumps(
                BannerSerializer(Banner.objects.from_moderated_merchants().vertical(), many=True).data),
            'products': json.dumps(ProductSerializer(Product.objects.from_moderated_merchants(), many=True).data),
            'backgrounds': [value for _, value in backgrounds.items()],
            'teasersOnMain': json.dumps(
                ProductSerializer(Product.objects.from_moderated_merchants().teasers_on_main(), many=True).data),
            'categories': json.dumps(CategorySerializer(Category.objects.all(), many=True).data)
        }
    )
