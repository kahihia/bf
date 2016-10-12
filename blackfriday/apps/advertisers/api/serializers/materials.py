from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from apps.advertisers.models import Banner
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
            'on_main': {'allow_null': False, 'allow_blank': False, 'required': True},
            'in_mailing': {'allow_null': False, 'allow_blank': False, 'required': True},
        }

    def to_representation(self, instance):
        return BannerDetailSerializer().to_representation(instance)

    def validate_categories(self, value):
        request = self.context['request']
        if request.user.role == 'advertiser':
            for cat in value:
                if cat.merchant and cat.merchant != request.user:
                    raise ValidationError('Категория недоступна')
        return value

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
