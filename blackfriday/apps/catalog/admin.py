from django.contrib import admin
from django.utils.html import format_html

from .models import Category, Product


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    pass


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        'thumb', 'name', 'brand', 'display_price', 'category', 'merchant',
    )
    list_filter = ('category', 'brand')
    search_fields = ('name', 'brand')

    def display_price(self, obj):
        if obj.price:
            return '{} р'.format(obj.price)
        if obj.discount:
            return '{} %'.format(obj.discount)
        if obj.start_price:
            return 'от {} р'.format(obj.start_price)
    display_price.short_description = 'Отображаемая цена'

    def thumb(self, obj):
        return format_html('<img src="{}" alt="" style="max-width: 75px; max-height: 75px;"/>', obj.image)

    thumb.short_description = 'Изображение'
