from django.contrib import admin

from .models import AdvertiserProfile, Merchant


@admin.register(AdvertiserProfile)
class AdvertiserAdmin(admin.ModelAdmin):
    pass


@admin.register(Merchant)
class MerchantAdmin(admin.ModelAdmin):
    pass
