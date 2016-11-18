from django.template.loader import render_to_string
from django.db.models import *

from djangorestframework_camel_case.render import CamelCaseJSONRenderer

from apps.banners.models import Partner
from apps.advertisers.models import Merchant, Banner, BannerType
from apps.catalog.models import Product, Category

from apps.showcase.serializers import *
from apps.showcase.utils import serializer_factory

json = CamelCaseJSONRenderer()


def get_backgrounds(on_main=False, **kwargs):
    background_qs = Merchant.objects.filter(**kwargs).moderated().annotate(
        left=Max(Case(When(
            banners__type=BannerType.BG_LEFT, then=F('banners__image__image')), output_field=CharField())
        ),
        right=Max(Case(When(
            banners__type=BannerType.BG_RIGHT, then=F('banners__image__image')), output_field=CharField())
        )
    ).values(
        'left', 'right', 'banners__url', 'id', 'banners__on_main'
    ).filter(Q(right__isnull=False) | Q(left__isnull=False),)
    backgrounds = {}
    for b in background_qs:
        if b['banners__on_main'] == on_main:
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


def partners(is_preview=False):
    context = {
        'teasers': json.render(
            ProductSerializer(
                Product.objects.from_moderated_merchants().teasers(),
                many=True
            ).data
        ),
        'categories': json.render(CategorySerializer(Category.objects.all(), many=True).data),
        'partners': json.render(PartnerSerializer(Partner.objects.all(), many=True).data),
    }

    if is_preview:
        context['is_preview'] = True

    return render_to_string('showcase/partners.html', context)


def russiangoods(is_preview=False):
    qs = Product.objects.from_moderated_merchants().russians()
    context = {
        'products': json.render(ProductSerializer(qs, many=True).data),
        'teasers': json.render(ProductSerializer(qs.teasers(), many=True).data),
        'categories': json.render(CategorySerializer(Category.objects.all(), many=True).data),
        'categoriesRus': json.render(RussianCategorySerializer(Category.objects.russians(), many=True).data)
    }

    if is_preview:
        context['is_preview'] = True

    return render_to_string('showcase/russiangoods.html', context)


def category(category_id, russian=False, is_preview=False):
    products = Product.objects.from_moderated_merchants().filter(category__id=category_id)
    if russian:
        products = products.russians()

    context = {
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
        context['categoriesRus'] = json.render(
            RussianCategorySerializer(
                Category.objects.russians(),
                many=True
            ).data
        )

    if is_preview:
        context['is_preview'] = True

    return render_to_string('showcase/category.html', context)


def merchant(merchant_id, is_preview=False):
    if is_preview:
        superbanners_queryset = Banner.objects.super().filter(in_mailing=False, merchant_id=merchant_id)
        banners_queryset = Banner.objects.action().filter(merchant_id=merchant_id)
        products_queryset = Product.objects.filter(merchant_id=merchant_id)
        teasers_queryset = Product.objects.teasers()
    else:
        superbanners_queryset = Banner.objects.super().from_moderated_merchants().filter(
            in_mailing=False, merchant_id=merchant_id
        )
        banners_queryset = Banner.objects.action().from_moderated_merchants().filter(merchant_id=merchant_id)
        products_queryset = Product.objects.from_moderated_merchants().filter(merchant_id=merchant_id)
        teasers_queryset = Product.objects.from_moderated_merchants().teasers()

    context = {
        'superbanners': json.render(
            SuperbannerSerializer(superbanners_queryset, many=True).data
        ),
        'banners': json.render(
            BannerSerializer(banners_queryset, many=True).data
        ),
        'products': json.render(
            ProductSerializer(products_queryset, many=True).data
        ),
        'partners': json.render(
            PartnerSerializer(
                Partner.objects.filter(merchants__id=merchant_id),
                many=True
            ).data
        ),
        'teasers': json.render(
            ProductSerializer(teasers_queryset, many=True).data
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

    if is_preview:
        context['is_preview'] = True

    return render_to_string('showcase/merchant.html', context)


def merchants(is_preview=False):
    context = {
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

    if is_preview:
        context['is_preview'] = True

    return render_to_string('showcase/merchants.html', context)


def actions(is_preview=False):
    context = {
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

    if is_preview:
        context['is_preview'] = True

    return render_to_string('showcase/actions.html', context)


def main_page(is_preview=False):
    context = {
        'superbanners': json.render(
            SuperbannerSerializer(
                Banner.objects.super().from_moderated_merchants().filter(on_main=True),
                many=True
            ).data
        ),
        'merchants': json.render(
            MerchantSerializer(
                Merchant.objects.moderated().annotate(
                    logo_on_main=Max(
                        Case(
                            When(
                                invoices__promo__options__option__tech_name='logo_on_main',
                                then=F('invoices__promo__options__value')
                            ),
                            output_field=IntegerField())
                    )
                ).filter(logo_on_main__gt=0),
                many=True
            ).data
        ),
        'partners': json.render(PartnerSerializer(Partner.objects.all(), many=True).data),
        'banners': json.render(
            BannerSerializer(
                Banner.objects.from_moderated_merchants().filter(type=BannerType.ACTION, on_main=True),
                many=True
            ).data
        ),
        'verticalbanners': json.render(
            BannerSerializer(Banner.objects.from_moderated_merchants().vertical(), many=True).data),
        'products': json.render(ProductSerializer(Product.objects.from_moderated_merchants(), many=True).data),
        'backgrounds': get_backgrounds(on_main=True),
        'teasersOnMain': json.render(
            ProductSerializer(Product.objects.from_moderated_merchants().teasers_on_main(), many=True).data),
        'categories': json.render(CategorySerializer(Category.objects.all(), many=True).data)
    }

    if is_preview:
        context['is_preview'] = True

    return render_to_string('showcase/main.html', context)