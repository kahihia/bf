from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from django.db.models import Q

from apps.advertisers.models import Banner, BannerType
from apps.catalog.models import Category
from apps.mediafiles.models import Image
from apps.promo.models import Option

from apps.catalog.api.serializers import CategorySerializer
from apps.mediafiles.api.serializers import ImageSerializer


class BannerDetailSerializer(serializers.ModelSerializer):
    image = ImageSerializer()
    categories = CategorySerializer(many=True)

    class Meta:
        model = Banner
        fields = ('id', 'type', 'image', 'url', 'on_main', 'in_mailing', 'categories')


class BannerSerializer(BannerDetailSerializer):
    image = serializers.PrimaryKeyRelatedField(queryset=Image.objects.all())
    categories = serializers.ListSerializer(child=serializers.PrimaryKeyRelatedField(queryset=Category.objects.all()))

    class Meta(BannerDetailSerializer.Meta):
        extra_kwargs = {
            'on_main': {'required': True},
            'in_mailing': {'required': True},
        }

    def to_representation(self, instance):
        return BannerDetailSerializer().to_representation(instance)

    def validate_categories(self, value):
        request = self.context['request']
        for cat in value:
            if cat.merchant and cat.merchant.advertiser != request.user:
                raise ValidationError('Категория недоступна')
        return value

    def validate(self, attrs):
        if attrs.get('type') == BannerType.SUPER or (self.instance and self.instance.type == BannerType.SUPER):
            if (
                attrs.get('in_mailing', self.instance.in_mailing if self.instance else False) and
                (
                    attrs.get('on_main', self.instance.on_main if self.instance else False) or
                    attrs.get('categories', self.instance.categories.exists() if self.instance else False)
                )
            ):
                raise ValidationError('Нельзя разместить один и тот же баннер и на сайте, и в рассылке')
            if (
                Banner.objects.exclude(pk=self.instance.pk if self.instance else None).filter(
                    Q(on_main=True) | Q(categories__isnull=False), merchant=self.context['merchant'],
                    type=BannerType.SUPER
                ) and (attrs.get('on_main', False) or attrs.get('categories'))
            ):
                raise ValidationError('В категориях и на главной можно разместить только один супербаннер')
        return attrs

    def save(self, **kwargs):
        categories = self._validated_data.pop('categories', [])
        instance = super().save(**kwargs)

        instance.categories.clear()
        for category in categories:
            instance.categories.add(category)

        instance.merchant.moderation_status = 0
        instance.merchant.save()

        return instance


class AvailableOptionSerializer(serializers.ModelSerializer):
    available_value = serializers.IntegerField(source='count_available')

    class Meta:
        model = Option
        fields = ('id', 'name', 'tech_name', 'price', 'available_value', 'is_boolean', 'image')


class LimitSerializer(serializers.Serializer):
    tech_name = serializers.CharField()
    value = serializers.IntegerField()
