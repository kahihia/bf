from django.contrib import admin
from .models import Subscriber, AdvertiserRequest


@admin.register(Subscriber)
class SubscriberAdmin(admin.ModelAdmin):
    pass


@admin.register(AdvertiserRequest)
class AdvertiserRequestAdmin(admin.ModelAdmin):
    pass
