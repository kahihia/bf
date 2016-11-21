import os
from django.template.loader import render_to_string
from django.conf import settings


from apps.banners.models import Partner

from .models import LandingLogo
from .exceptions import NoContent


def get_landing_context():
    remainder = LandingLogo.objects.count() % 5

    return {
        'SITE_URL': settings.SITE_URL,
        'SHOW_LOGIN_ON_LANDING': settings.SHOW_LOGIN_ON_LANDING,
        'partner_list': Partner.objects.all(),
        'logo_list': LandingLogo.objects.all(),
        'logo_stubs': ('*' * (5 - remainder)) if remainder else ''
    }


def render_landing(raise_exception=True):
    path = os.path.join(settings.PROJECT_ROOT, 'landing')
    os.makedirs(path, exist_ok=True)
    if raise_exception and not (LandingLogo.objects.exists() and Partner.objects.exists()):
        raise NoContent
    for filename, template in [
        ('index.html', 'landing/landing.html'),
        ('index-cn.html', 'landing/landing-cn.html'),
        ('kontakty', 'landing/landing-contacts.html'),
    ]:
        with open(os.path.join(path, filename), 'w') as f:
            f.seek(0)
            f.write(
                render_to_string(
                    template,
                    get_landing_context()
                )
            )
            f.truncate()
