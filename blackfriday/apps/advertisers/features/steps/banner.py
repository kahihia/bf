import pytest

from pytest_bdd import given
from libs.testing.parsers import AsciiTableParser

from apps.advertisers.tests.factories import BannerFactory

pytestmark = pytest.mark.django_db


@given(AsciiTableParser('I have banners:\n{data}'))
def banners(data, moderated_merchant):
    return [BannerFactory.create(merchant=moderated_merchant, **row) for row in data]
