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


@when(AsciiTableParser('I create banner with:\n{data}'))
def create_banner(client, data, moderated_merchant, state):
    row = data[0]
    required_fields = {'url', 'image', 'type'}
    missed_fields = required_fields - {field for field in row}
    if missed_fields:
        example = BannerFactory.build()
        for field in missed_fields:
            if field == 'image':
                row[field] = getattr(example, 'image_id')
            else:
                row[field] = getattr(example, field)

    state['last_response'] = client.post(
        reverse('api:advertisers:banners-list', args=(moderated_merchant.pk,)),
        data=json.dumps(data[0]),
        content_type='application/json'
    )


@pytest.fixture(scope='session')
def state():
    return {}


@when(AsciiTableParser('I change banner with:\n{data}'))
def update_banner(banner, client, data, state):
    state['last_response'] = client.patch(
        reverse('api:advertisers:banners-detail', args=(banner.merchant.pk, banner.pk)),
        data=json.dumps(data[0]),
        content_type='application/json'
    )


@then(parsers.parse('response status is {value}'))
def check_response(value, state):
    assert state['last_response'].status_code == int(value)


@when('I delete banner')
def delete_banner(client, state, banner):
    state['last_response'] = client.delete(
        reverse('api:advertisers:banners-detail', args=(banner.merchant.pk, banner.pk)),
    )
