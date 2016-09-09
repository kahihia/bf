from django.contrib import admin

from .models import Invoice, InvoiceOption


class InvoiceOptionInline(admin.TabularInline):
    model = InvoiceOption
    fields = ['option', 'price', 'value']
    extra = 1


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    inlines = [InvoiceOptionInline]
