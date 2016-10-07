from admin_decorators import short_description
from django.contrib import admin

from apps.promo.models import Option

from .models import Category


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    actions = ['delete_selected']

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        Option.calculate_restrictions()

    def delete_model(self, request, obj):
        super().delete_model(request, obj)
        Option.calculate_restrictions()

    def save_formset(self, request, form, formset, change):
        super().save_formset(request, form, formset, change)
        Option.calculate_restrictions()

    @short_description('Удалить выбранные')
    def delete_selected(self, request, queryset):
        queryset.delete()
        Option.calculate_restrictions()
