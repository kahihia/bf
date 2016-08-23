from django.contrib import admin

from .models import AdvertiserProfile


@admin.register(AdvertiserProfile)
class AdvertiserAdmin(admin.ModelAdmin):
    pass
