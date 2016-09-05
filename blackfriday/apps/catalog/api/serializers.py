from rest_framework import serializers

from ..models import Category, Product


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name', 'slug')

class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer()
    image_url = serializers.URLField(source='image.url')
    class Meta:
        model = Product
        fields = (
            'id', 'name', 'category', 'name', 'price', 'old_price', 'start_price', 'discount',
            'country', 'is_teaser', 'is_teaser_on_main', 'brand', 'url', 'datetime_created', 'image_url'
        )
