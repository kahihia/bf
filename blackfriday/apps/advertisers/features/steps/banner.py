import json
import pytest

from pytest_bdd import given, parsers, when, then
from django.core.urlresolvers import reverse
from libs.testing.parsers import AsciiTableParser

from apps.advertisers.tests.factories import BannerFactory

pytestmark = pytest.mark.django_db


WORDS_TO_NUMBERS = {
    'first': 0,
    'second': 1,
    'third': 2
}


@given(AsciiTableParser('I have banner:\n{data}'))
def banner(data, moderated_merchant):
    return [BannerFactory.create(merchant=moderated_merchant, **row) for row in data]


@given(AsciiTableParser('I have banners:\n{data}'))
def banners(data, moderated_merchant):
    return [BannerFactory.create(merchant=moderated_merchant, **row) for row in data]


@when(AsciiTableParser('I {action} banner with:\n{data}'))
def action_to_banner(action, client, data, user):
    assert action in ('create', 'change')
    if action == 'create':
        return client.post(
            reverse('api:advertisers:banners-list', args=(user.pk,)),
            data=json.dumps(data),
            content_type='application/json'
        )
    if action == 'change':
        return client.post(
            reverse('api:advertisers:banners-detail', args=(user.pk, banner.pk)),
            data=json.dumps(data),
            content_type='application/json'
        )


@then(parsers.parse('response {attr} is {value}'))
def check_response(action_to_banner, attr, value):
    assert getattr(action_to_banner, attr) == value
