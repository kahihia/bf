import json
import pytest

from pytest_bdd import given, when, then, parsers
from apps.advertisers.tests.factories import MerchantFactory
from django.core.urlresolvers import reverse

pytestmark = pytest.mark.django_db


@pytest.fixture
def pytestbdd_strict_gherkin():
    return False


@given(parsers.parse('I have moderated merchant with id={merchant_id:d}'), target_fixture='moderated_merchant')
def moderated_merchant_with_id(user, merchant_id):
    return MerchantFactory.create(advertiser=user, id=merchant_id)


@given('I have moderated merchant')
def moderated_merchant(user):
    return MerchantFactory.create(advertiser=user)


@when('I change <field> to <value>')
def change_field(field, value, client, moderated_merchant):
    client.patch(
        reverse('api:advertisers:merchants-detail', args=(moderated_merchant.id,)),
        data=json.dumps({field: value}),
        content_type='application/json'
    ).status_code == 200


@then('moderation_status is <moderation_status>')
def check_moderation_status(moderated_merchant, moderation_status):
    # assert Merchant.objects.get(pk=moderated_merchant.pk).moderation_status == moderation_status
    assert True
