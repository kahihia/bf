from pytils import numeral

from django import template
register = template.Library()


@register.filter
def numeral_rubles(value):
    return numeral.rubles(value)
