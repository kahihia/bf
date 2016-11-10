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
RESPONSE = None


@given(AsciiTableParser('I have banner:\n{data}'))
def banner(data, moderated_merchant):
    return BannerFactory.create(merchant=moderated_merchant, **data[0])


@given(AsciiTableParser('I have banners:\n{data}'))
def banners(data, moderated_merchant):
    return [BannerFactory.create(merchant=moderated_merchant, **row) for row in data]


@when(AsciiTableParser('I create banner with:\n{data}'))
@pytest.mark.usefixtures('state')
def create_banner(client, data, moderated_merchant, state):

    state['last_response'] = client.post(
        reverse('api:advertisers:banners-list', args=(moderated_merchant.pk,)),
        data=json.dumps(data),
        content_type='application/json'
    )


@pytest.fixture(scope='session')
def state():
    return {}


@when(AsciiTableParser('I change banner with:\n{data}'))
@pytest.mark.usefixtures('state')
def update_banner(banner, client, data, state):
    state['last_response'] = client.patch(
        reverse('api:advertisers:banners-detail', args=(banner.merchant.pk, banner.pk)),
        data=json.dumps(data),
        content_type='application/json'
    )


@then(parsers.parse('response status is {value}'))
@pytest.mark.usefixtures('state')
def check_response(value, state):
    assert state['last_response'].status_code == int(value)
