from django.contrib import admin

from .models import AdvertiserProfile, Merchant, Banner


@admin.register(AdvertiserProfile)
class AdvertiserAdmin(admin.ModelAdmin):
    list_display = ('user', 'is_valid', 'is_supernova', 'type')
    search_fields = ('user__email', )
    list_filter = ('type', )

    def is_valid(self, obj):
        return obj.is_valid

    is_valid.boolean = True
    is_valid.short_description = 'Валиден'

    def is_supernova(self, obj):
        return obj.is_supernova

    is_supernova.boolean = True
    is_supernova.short_description = 'Является ли сверхновой'


class BannerInline(admin.TabularInline):
    model = Banner
    extra = 0
    verbose_name = 'Баннер'
    verbose_name_plural = 'Баннеры'
    fields = ['type', 'image', 'url', 'categories', 'on_main', 'in_mailing', 'was_mailed']


@admin.register(Merchant)
class MerchantAdmin(admin.ModelAdmin):
    inlines = [BannerInline]
    list_display = ('name', 'moderation_status', 'is_active', 'slug', 'advertiser')
    search_fields = ('name', )
    list_filter = ('moderation_status', 'is_active')
