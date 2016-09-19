import pytest

from .factories import MerchantFactory


@pytest.fixture
def merchant():
    return MerchantFactory.create()
