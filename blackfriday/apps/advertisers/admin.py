from django.contrib import admin

from .models import AdvertiserProfile, Merchant, Banner


@admin.register(AdvertiserProfile)
class AdvertiserAdmin(admin.ModelAdmin):
    pass


class BannerInline(admin.TabularInline):
    model = Banner
    extra = 0
    verbose_name = 'Баннер'
    verbose_name_plural = 'Баннеры'
    fields = ['type', 'image', 'url', 'categories', 'on_main', 'in_mailing', 'was_mailed']


@admin.register(Merchant)
class MerchantAdmin(admin.ModelAdmin):
    inlines = [BannerInline]
