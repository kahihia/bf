from django.contrib import admin

from .models import LandingLogo


@admin.register(LandingLogo)
class LandingLogoAdmin(admin.ModelAdmin):
    pass
