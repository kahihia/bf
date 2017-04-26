import requests

from django.conf import settings
from ipware.ip import get_ip


def check(request, data=None):
    if not data:
        data = request.data
    return is_valid(request, data.get('g-recaptcha-response'))


def is_valid(request, token):
    data = {
        'secret': settings.RECAPTCHA_SECRET_KEY,
        'response': token,
        'remoteip': get_ip(request)
    }
    r = requests.post('https://www.google.com/recaptcha/api/siteverify', data=data)
    return r.json().get('success', False)
