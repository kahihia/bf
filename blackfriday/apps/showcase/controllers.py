import json
from django.template.loader import render_to_string
from django.db.models import *

from django.conf import settings

from apps.banners.models import Partner
from apps.advertisers.models import Merchant, Banner, BannerType
from apps.catalog.models import Product, Category

from apps.showcase.serializers import *
from apps.showcase.utils import serializer_factory


def get_backgrounds(**kwargs):
    background_qs = Merchant.objects.filter(**kwargs).moderated().annotate(
        left=Max(Case(When(
            banners__type=BannerType.BG_LEFT, then=F('banners__image__image')), output_field=CharField())
        ),
        right=Max(Case(When(
            banners__type=BannerType.BG_RIGHT, then=F('banners__image__image')), output_field=CharField())
        )
    ).values(
        'left', 'right', 'banners__url', 'id'
    ).filter(Q(right__isnull=False) | Q(left__isnull=False))
    backgrounds = {}
    for b in background_qs:
        b_id = b['id']
        if b_id not in backgrounds:
            backgrounds[b_id] = {}
        if b['left']:
            backgrounds[b_id]['left'] = '{}{}{}'.format(settings.SITE_URL, settings.MEDIA_URL, b['left'])
        if b['right']:
            backgrounds[b_id]['right'] = '{}{}{}'.format(settings.SITE_URL, settings.MEDIA_URL, b['right'])
        backgrounds[b_id]['id'] = b_id
        backgrounds[b_id]['url'] = b['banners__url']
    return [value for _, value in backgrounds.items()]


def partners():
    return render_to_string(
        'showcase/partners.html',
        {
            'teasers': json.dumps(
                ProductSerializer(
                    Product.objects.from_moderated_merchants().teasers(),
                    many=True
                ).data
            ),
            'categories': json.dumps(CategorySerializer(Category.objects.all(), many=True).data),
            'partners': json.dumps(PartnerSerializer(Partner.objects.all(), many=True).data),
        }
    )


def russiangoods():
    qs = Product.objects.from_moderated_merchants().russians()
    return render_to_string(
        'showcase/russiangoods.html',
        {
            'products': json.dumps(ProductSerializer(qs, many=True).data),
            'teasers': json.dumps(ProductSerializer(qs.teasers(), many=True).data),
            'categories': json.dumps(CategorySerializer(Category.objects.all(), many=True).data),
            'categories_rus': json.dumps(RussianCategorySerializer(Category.objects.russians(), many=True).data)
        }
    )


def category(category_id, russian=False):
    products = Product.objects.from_moderated_merchants().filter(category__id=category_id)
    if russian:
        products = products.russians()
    return render_to_string(
        'showcase/category.html',
        {
            'superbanners': json.dumps(
                SuperbannerSerializer(
                    Banner.objects.super().from_moderated_merchants().filter(
                        in_mailing=False, categories__id=category_id),
                    many=True
                ).data
            ),
            'merchants': json.dumps(
                MerchantSerializer(
                    Merchant.objects.moderated().filter(logo_categories__id=category_id),
                    many=True
                ).data
            ),
            'banners': json.dumps(
                BannerSerializer(
                    Banner.objects.action().from_moderated_merchants().filter(categories__id=category_id),
                    many=True
                ).data
            ),
            'products': json.dumps(
                ProductSerializer(
                    Product.objects.from_moderated_merchants().filter(category__id=category_id),
                    many=True
                ).data
            ),
            'backgrounds': json.dumps(get_backgrounds(categories__id=category_id)),
            'teasers': json.dumps(
                ProductSerializer(
                    Product.objects.from_moderated_merchants().teasers(),
                    many=True
                ).data
            ),
            'categories': json.dumps(CategorySerializer(Category.objects.all(), many=True).data),
            'category': json.dumps(CategorySerializer(Category.objects.get(id=category_id)).data),
        }
    )


def merchant(merchant_id):
    return render_to_string(
        'showcase/merchant.html',
        {
            'superbanners': json.dumps(
                SuperbannerSerializer(
                    Banner.objects.super().from_moderated_merchants().filter(
                        in_mailing=False, merchant_id=merchant_id),
                    many=True
                ).data
            ),
            'banners': json.dumps(
                BannerSerializer(
                    Banner.objects.action().from_moderated_merchants().filter(merchant_id=merchant_id),
                    many=True
                ).data
            ),
            'products': json.dumps(
                ProductSerializer(
                    Product.objects.from_moderated_merchants().filter(merchant_id=merchant_id),
                    many=True
                ).data
            ),
            'partners': json.dumps(
                PartnerSerializer(
                    Partner.objects.filter(merchants__id=merchant_id),
                    many=True
                ).data
            ),
            'teasers': json.dumps(
                ProductSerializer(
                    Product.objects.from_moderated_merchants().teasers(),
                    many=True
                ).data
            ),
            'categories': json.dumps(CategorySerializer(Category.objects.all(), many=True).data),
            'merchant': json.dumps(
                serializer_factory(
                    cls_name='advertisers.Merchant',
                    fields=('name', 'url', 'description', 'image', 'promocode'),
                    image=serializers.SerializerMethodField(),
                    get_image=get_image,
                )(
                    Merchant.objects.get(id=merchant_id)
                ).data
            )
        }
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
                ProductSerializer(Product.objects.teasers().from_moderated_merchants(), many=True).data),
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
                BannerSerializer(Banner.objects.action().from_moderated_merchants(), many=True).data),
            'products': json.dumps(
                ProductSerializer(Product.objects.from_moderated_merchants(), many=True).data),
            'teasers': json.dumps(
                ProductSerializer(Product.objects.from_moderated_merchants().teasers(), many=True).data),
            'categories': json.dumps(CategorySerializer(Category.objects.all(), many=True).data)

        }
    )


def main_page():
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
            'banners': json.dumps(
                BannerSerializer(
                    Banner.objects.from_moderated_merchants().filter(type=BannerType.ACTION),
                    many=True
                ).data
            ),
            'verticalbanners': json.dumps(
                BannerSerializer(Banner.objects.from_moderated_merchants().vertical(), many=True).data),
            'products': json.dumps(ProductSerializer(Product.objects.from_moderated_merchants(), many=True).data),
            'backgrounds': get_backgrounds(),
            'teasersOnMain': json.dumps(
                ProductSerializer(Product.objects.from_moderated_merchants().teasers_on_main(), many=True).data),
            'categories': json.dumps(CategorySerializer(Category.objects.all(), many=True).data)
        }
    )
