from rest_framework import serializers

from ..models import Category, Product


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name', 'slug')


class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer()

    class Meta:
        model = Product
        fields = (
            'id', 'category', 'name', 'price', 'old_price', 'start_price', 'discount',
            'country', 'is_teaser', 'is_teaser_on_main', 'brand', 'url', 'created_datetime', 'image'
        )
