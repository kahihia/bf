from django.conf import settings


def site_url(request):
    return {
        'SITE_URL': settings.SITE_URL
    }


def showcase_enabled(request):
    return {
        'SHOWCASE_ENABLED': settings.SHOWCASE_ENABLED
    }
