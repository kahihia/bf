import pytest

from django.core.urlresolvers import reverse

from apps.advertisers.tests.factories import MerchantFactory
from apps.orders.tests.factories import InvoiceFactory

from apps.advertisers.models import Merchant

pytestmark = pytest.mark.django_db

increment_counters_route = reverse('api:mailing:mailing_banners-increment-counters')


def test_increment_counters_expect_banner_counters_incremented(admin_logged_client):
    m = MerchantFactory.create()

    InvoiceFactory.create(options__option__tech_name='mailing', options__value=1, is_paid=True, merchant=m)
    response = admin_logged_client.post(increment_counters_route)
    assert response.status_code == 200
    assert (Merchant.objects.get(id=m.id).banner_mailings_count - m.banner_mailings_count) == 1


def test_increment_counters_expect_superbanner_counters_incremented(admin_logged_client):
    m = MerchantFactory.create()

    InvoiceFactory.create(
        options__option__tech_name='superbanner_at_mailing', options__value=1, is_paid=True, merchant=m
    )
    response = admin_logged_client.post(increment_counters_route)
    assert response.status_code == 200
    assert (Merchant.objects.get(id=m.id).superbanner_mailings_count - m.superbanner_mailings_count) == 1


def test_increment_counters_expect_bannerscounters_not_incremented(admin_logged_client):
    m = MerchantFactory.create(banner_mailings_count=1)

    InvoiceFactory.create(options__option__tech_name='mailing', options__value=1, is_paid=True, merchant=m)
    response = admin_logged_client.post(increment_counters_route)
    assert response.status_code == 200
    assert Merchant.objects.get(id=m.id).banner_mailings_count == m.banner_mailings_count


def test_increment_counters_expect_superbanners_counters_not_incremented(admin_logged_client):
    m = MerchantFactory.create(superbanner_mailings_count=1)

    InvoiceFactory.create(
        options__option__tech_name='superbanner_at_mailing', options__value=1, is_paid=True, merchant=m
    )
    response = admin_logged_client.post(increment_counters_route)
    assert response.status_code == 200
    assert Merchant.objects.get(id=m.id).superbanner_mailings_count == m.superbanner_mailings_count
