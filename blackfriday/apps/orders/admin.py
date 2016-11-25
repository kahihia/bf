from django.contrib import admin

from .models import Invoice, InvoiceOption


class InvoiceOptionInline(admin.TabularInline):
    model = InvoiceOption
    fields = ['option', 'price', 'value']
    extra = 1


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    inlines = [InvoiceOptionInline]
    list_display = ('merchant', 'sum', 'discount', 'is_paid', 'promo')
    list_filter = ('is_paid', 'promo')
    search_fields = ('merchant__name', )
    ordering = ('sum', 'discount')
