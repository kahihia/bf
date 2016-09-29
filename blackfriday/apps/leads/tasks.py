import dicttoxml
import requests

from django.conf import settings

from django_rq import job

from .models import Subscriber


@job
def delete_subscriber(email):
    requests.delete(
        settings.EXPERT_SENDER_URL + '/Api/Subscribers',
        params={
            'apiKey': settings.EXPERT_SENDER_KEY,
            'listId': settings.EXPERT_SENDER_LIST,
            'email': email
        }
    )


@job
def save_subscriber(email, name=None):
    data = {
        'ListId': settings.EXPERT_SENDER_LIST,
        'Email': email
    }

    if name:
        data['Name'] = name

    requests.post(
        settings.EXPERT_SENDER_URL + '/Api/Subscribers',
        headers={'Content-Type': 'application/xml'},
        data=dicttoxml.dicttoxml({
            'ApiKey': settings.EXPERT_SENDER_KEY,
            'Data': data
        }, custom_root='ApiRequest', attr_type=False)
    )


def save_all_subscribers():
    data = []

    for subscriber in Subscriber.objects.all():
        obj = {
            'Email': subscriber.email,
            'ListId': settings.EXPERT_SENDER_LIST
        }
        if subscriber.name:
            obj['Name'] = subscriber.name
        data.append(obj)

    requests.post(
        settings.EXPERT_SENDER_URL + '/Api/Subscribers',
        headers={'Content-Type': 'application/xml'},
        data=dicttoxml.dicttoxml({
            'ApiKey': settings.EXPERT_SENDER_KEY,
            'MultiData': data
        }, custom_root='ApiRequest', attr_type=False, item_func=lambda x: 'Subscriber')
    )
