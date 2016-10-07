import os
from django.template.loader import render_to_string
from django.conf import settings


from apps.banners.models import Partner

from .models import LandingLogo
from .exceptions import NoContent


def render_landing(raise_exception=True):
    path = os.path.join(settings.PROJECT_ROOT, 'landing')
    os.makedirs(path, exist_ok=True)
    if raise_exception and not (LandingLogo.objects.exists() and Partner.objects.exists()):
        raise NoContent
    for filename, template in [('index.html', 'landing/landing.html'), ('index-cn.html', 'landing/landing-cn.html')]:
        with open(os.path.join(path, filename), 'w') as f:
            f.seek(0)
            f.write(
                render_to_string(
                    template,
                    {
                        'SITE_URL': settings.SITE_URL,
                        'partner_list': Partner.objects.all(),
                        'logo_list': LandingLogo.objects.all(),
                    }
                )
            )
            f.truncate()
