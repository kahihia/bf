from django.contrib import admin

from .models import Option, Promo, PromoOption


class PromoOptionInline(admin.TabularInline):
    model = PromoOption
    fields = ['option', 'value']
    extra = 1


@admin.register(Option)
class OptionAdmin(admin.ModelAdmin):
    readonly_fields = ['image']


@admin.register(Promo)
class PromoAdmin(admin.ModelAdmin):
    inlines = [PromoOptionInline]
