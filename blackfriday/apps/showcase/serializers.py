from django.conf import settings
from rest_framework import serializers

from apps.showcase.utils import serializer_factory



MerchantSerializer = serializer_factory(
    cls_name='advertisers.Merchant',
    fields=('id', 'name', 'url', 'image'),
    image=serializers.SerializerMethodField(),
    url=serializers.SerializerMethodField(),
    get_image=lambda _, obj: str(obj.image),
    get_url=lambda self, obj: '/merchant/{}'.format(obj.slug),
)
PartnerSerializer = serializer_factory(
    cls_name='banners.Partner',
    fields=('id', 'name', 'url', 'image'),
    image=serializers.SerializerMethodField(),
    get_image=lambda _, obj: obj.image.url
)
BannerSerializer = serializer_factory(
    cls_name='advertisers.Banner',
    fields=('id', 'url', 'merchant', 'image'),
    image=serializers.SerializerMethodField(),
    get_image=lambda _, obj: str(obj.image),
    merchant=MerchantSerializer(),

)
ProductSerializer = serializer_factory(
    cls_name='catalog.Product',
    fields=('id', 'category', 'name', 'price', 'old_price', 'start_price', 'discount', 'merchant', 'url', 'image'),
    merchant=MerchantSerializer(),
    category=serializers.CharField(source='category.name')
)
CategorySerializer = serializer_factory(
    cls_name='catalog.Category',
    fields=('id', 'name', 'url'),
    url=serializers.SerializerMethodField(),
    get_url=lambda self, obj: '/category/{}'.format(obj.slug),
)
RussianCategorySerializer = serializer_factory(
    cls_name='catalog.Category',
    fields=('id', 'name', 'url'),
    url=serializers.SerializerMethodField(),
    get_url=lambda self, obj: '/russian-goods/{}'.format(obj.slug),
)
ForeignCategorySerializer = serializer_factory(
    cls_name='catalog.Category',
    fields=('id', 'name', 'url'),
    url=serializers.SerializerMethodField(),
    get_url=lambda self, obj: '/foreign-goods/{}'.format(obj.slug),
)
SuperbannerSerializer = serializer_factory(
    cls_name='advertisers.Banner',
    fields=('id', 'image', 'url', 'merchant'),
    image=serializers.SerializerMethodField(),
    merchant=MerchantSerializer(),
    get_image=lambda _, obj: str(obj.image),
)
