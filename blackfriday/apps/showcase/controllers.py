from django.template.loader import render_to_string
from django.db.models import *

from djangorestframework_camel_case.render import CamelCaseJSONRenderer

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
    json = CamelCaseJSONRenderer()
    return render_to_string(
        'showcase/partners.html',
        {
            'teasers': json.render(
                ProductSerializer(
                    Product.objects.from_moderated_merchants().teasers(),
                    many=True
                ).data
            ),
            'categories': json.render(CategorySerializer(Category.objects.all(), many=True).data),
            'partners': json.render(PartnerSerializer(Partner.objects.all(), many=True).data),
        }
    )


def russiangoods():
    json = CamelCaseJSONRenderer()
    qs = Product.objects.from_moderated_merchants().russians()
    return render_to_string(
        'showcase/russiangoods.html',
        {
            'products': json.render(ProductSerializer(qs, many=True).data),
            'teasers': json.render(ProductSerializer(qs.teasers(), many=True).data),
            'categories': json.render(CategorySerializer(Category.objects.all(), many=True).data),
            'categoriesRus': json.render(RussianCategorySerializer(Category.objects.russians(), many=True).data)
        }
    )


def category(category_id, russian=False):
    json = CamelCaseJSONRenderer()
    products = Product.objects.from_moderated_merchants().filter(category__id=category_id)
    if russian:
        products = products.russians()
    data = {
        'superbanners': json.render(
            SuperbannerSerializer(
                Banner.objects.super().from_moderated_merchants().filter(
                    in_mailing=False, categories__id=category_id),
                many=True
            ).data
        ),
        'merchants': json.render(
            MerchantSerializer(
                Merchant.objects.moderated().filter(logo_categories__id=category_id),
                many=True
            ).data
        ),
        'banners': json.render(
            BannerSerializer(
                Banner.objects.action().from_moderated_merchants().filter(categories__id=category_id),
                many=True
            ).data
        ),
        'products': json.render(
            ProductSerializer(
                Product.objects.from_moderated_merchants().filter(category__id=category_id),
                many=True
            ).data
        ),
        'backgrounds': json.render(get_backgrounds(categories__id=category_id)),
        'teasers': json.render(
            ProductSerializer(
                Product.objects.from_moderated_merchants().teasers(),
                many=True
            ).data
        ),
        'categories': json.render(CategorySerializer(Category.objects.all(), many=True).data),
        'category': json.render(CategorySerializer(Category.objects.get(id=category_id)).data),
    }
    if russian:
        data['categoriesRus'] = json.render(
            RussianCategorySerializer(
                Category.objects.russians(),
                many=True
            ).data
        )
    return render_to_string(
        'showcase/category.html',
        data
    )


def merchant(merchant_id):
    json = CamelCaseJSONRenderer()
    return render_to_string(
        'showcase/merchant.html',
        {
            'superbanners': json.render(
                SuperbannerSerializer(
                    Banner.objects.super().from_moderated_merchants().filter(
                        in_mailing=False, merchant_id=merchant_id),
                    many=True
                ).data
            ),
            'banners': json.render(
                BannerSerializer(
                    Banner.objects.action().from_moderated_merchants().filter(merchant_id=merchant_id),
                    many=True
                ).data
            ),
            'products': json.render(
                ProductSerializer(
                    Product.objects.from_moderated_merchants().filter(merchant_id=merchant_id),
                    many=True
                ).data
            ),
            'partners': json.render(
                PartnerSerializer(
                    Partner.objects.filter(merchants__id=merchant_id),
                    many=True
                ).data
            ),
            'teasers': json.render(
                ProductSerializer(
                    Product.objects.from_moderated_merchants().teasers(),
                    many=True
                ).data
            ),
            'categories': json.render(CategorySerializer(Category.objects.all(), many=True).data),
            'merchant': json.render(
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
    json = CamelCaseJSONRenderer()
    return render_to_string(
        'showcase/merchants.html',
        {
            'is_preview': True,
            'merchants': json.render(MerchantSerializer(Merchant.objects.moderated(), many=True).data),
            'superbanners': json.render(
                SuperbannerSerializer(
                    Banner.objects.super().from_moderated_merchants().filter(in_mailing=False),
                    many=True
                ).data
            ),
            'teasers': json.render(
                ProductSerializer(Product.objects.teasers().from_moderated_merchants(), many=True).data),
            'categories': json.render(CategorySerializer(Category.objects.all(), many=True).data)
        }
    )


def actions():
    json = CamelCaseJSONRenderer()
    return render_to_string(
        'showcase/actions.html',
        {
            'superbanners': json.render(
                SuperbannerSerializer(
                    Banner.objects.super().from_moderated_merchants().filter(in_mailing=False),
                    many=True
                ).data
            ),
            'banners': json.render(
                BannerSerializer(Banner.objects.action().from_moderated_merchants(), many=True).data),
            'products': json.render(
                ProductSerializer(Product.objects.from_moderated_merchants(), many=True).data),
            'teasers': json.render(
                ProductSerializer(Product.objects.from_moderated_merchants().teasers(), many=True).data),
            'categories': json.render(CategorySerializer(Category.objects.all(), many=True).data)

        }
    )


def main_page():
    json = CamelCaseJSONRenderer()
    return render_to_string(
        'showcase/main.html',
        {
            'superbanners': json.render(
                SuperbannerSerializer(
                    Banner.objects.super().from_moderated_merchants().filter(on_main=True),
                    many=True
                ).data
            ),
            'merchants': json.render(MerchantSerializer(Merchant.objects.moderated(), many=True).data),
            'partners': json.render(PartnerSerializer(Partner.objects.all(), many=True).data),
            'banners': json.render(
                BannerSerializer(
                    Banner.objects.from_moderated_merchants().filter(type=BannerType.ACTION),
                    many=True
                ).data
            ),
            'verticalbanners': json.render(
                BannerSerializer(Banner.objects.from_moderated_merchants().vertical(), many=True).data),
            'products': json.render(ProductSerializer(Product.objects.from_moderated_merchants(), many=True).data),
            'backgrounds': get_backgrounds(),
            'teasersOnMain': json.render(
                ProductSerializer(Product.objects.from_moderated_merchants().teasers_on_main(), many=True).data),
            'categories': json.render(CategorySerializer(Category.objects.all(), many=True).data)
        }
    )
