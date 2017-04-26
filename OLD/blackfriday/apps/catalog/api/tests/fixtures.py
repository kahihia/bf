import pytest

from django.conf import settings

from apps.catalog.tests.factories import CategoryFactory, ProductFactory


@pytest.fixture
def default_category():
    return CategoryFactory.create(name=settings.DEFAULT_CATEGORY_NAME)


@pytest.fixture
def product_with_default_cat(default_category, merchant):
    return ProductFactory.create(category=default_category, merchant=merchant)
