from django.conf import settings


def reports_available(request):
    return {
        'REPORTS_ARE_AVAILABLE': settings.REPORTS_ARE_AVAILABLE
    }
