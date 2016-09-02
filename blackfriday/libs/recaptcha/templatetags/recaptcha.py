from django import template
from django.conf import settings
from django.utils.safestring import mark_safe

register = template.Library()


@register.simple_tag()
def recaptcha_init():
    return mark_safe(
        '<script src="https://www.google.com/recaptcha/api.js"></script>'
    )


@register.simple_tag()
def recaptcha():
    return mark_safe(
        '<div class="g-recaptcha" data-sitekey="{}" data-size="compact"></div>'.format(settings.RECAPTCHA_SITE_KEY)
    )
