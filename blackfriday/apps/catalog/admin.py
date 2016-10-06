from django.contrib import admin
from django.contrib.admin.actions import delete_selected as _delete_selected

from apps.promo.models import Option

from .models import Category


def delete_selected(modeladmin, request, queryset):
    _delete_selected(modeladmin, request, queryset)
    Option.calculate_restrictions()


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
