import pytest

import json

from django.core.urlresolvers import reverse
from django.conf import settings
from rest_framework.exceptions import ValidationError

from apps.users.tests.fixtures import *
from apps.advertisers.tests.fixtures import *
from libs.testing.helpers import lists_of_dicts_equalled

from apps.catalog.api.views import ProductViewSet
from apps.catalog.models import Product


pytestmark = pytest.mark.django_db

FAIL_SAMPLE = {
    'input': {
        "_id": 23,
        "category": "incorrect_category_name",
        "name": "name",
        "image": "image.com",
        "price": 101,
        "start_price": 'foo',
        "old_price": 100,
        "discount": 20,
        "country": "Country",
        "brand": "Brand",
        "url": "http://product_url",
        "currency": "bar"
    },
    'output': {
        'data': {
            "category": settings.DEFAULT_CATEGORY_NAME,
            "name": "name",
            "image": "image.com",
            "price": 101,
            "start_price": 'foo',
            "old_price": 100,
            "discount": 20,
            "country": "country",
            "brand": "Brand",
            "url": "http://product_url",
            "currency": "bar"
        },
        'warnings': [
            {'field': 'price', 'message': 'Старая цена больше новой'},
            {'field': 'old_price', 'message': 'Старая цена больше новой'},
            {'field': 'url', 'message': 'Отсутствуют utm метки'}
        ],
        'errors': [
            {'field': 'currency', 'message': 'Значение должно соответствовать одному из rur, usd, uah, kzt'},
            {'field': 'start_price', 'message': 'Отсутствует числовое значение'},
            {'field': 'image', 'message': "Строка должна содержать ('http://', 'https://')"}
        ]

    }
}


SUCCESS_SAMPLE = {
    "category": "correct_category_name",
    "name": "name",
    "image": "http://image.com",
    "price": 100,
    "start_price": 100,
    "old_price": 101,
    "discount": 20,
    "country": "Country",
    "brand": "Brand",
    "url": "http://product_url--utm_source--utm_medium--utm_campaign",
    "currency": "rur"
}


def test_validate_schema():
    with pytest.raises(ValidationError):
        ProductViewSet().validate_schema([[]])


def test_post_given_invalid_data_expect_400(admin_logged_client, merchant):
    response = admin_logged_client.post(
        reverse('api:catalog:products-list', args=(merchant.id,)),
        data=json.dumps([FAIL_SAMPLE['input']]), content_type='application/json')
    assert response.status_code == 400
    assert lists_of_dicts_equalled(response.data[0]['warnings'], FAIL_SAMPLE['output']['warnings'])
    assert lists_of_dicts_equalled(response.data[0]['errors'], FAIL_SAMPLE['output']['errors'])
    assert frozenset(response.data[0]['data'].items()) == frozenset(FAIL_SAMPLE['output']['data'].items())


def test_post_given_valid_list_expect_201_product_created(admin_logged_client, merchant, default_category):
    response = admin_logged_client.post(
        reverse('api:catalog:products-list', args=(merchant.id,)),
        data=json.dumps([SUCCESS_SAMPLE]), content_type='application/json')
    assert response.status_code == 201
    assert Product.objects.filter(name=SUCCESS_SAMPLE['name'], category=default_category).exists()


def test_put_given_invalid_data_expect_400(admin_logged_client, merchant, product_with_default_cat):
    response = admin_logged_client.put(
        reverse('api:catalog:products-detail', args=(merchant.id, product_with_default_cat.id)),
        data=json.dumps(FAIL_SAMPLE['input']), content_type='application/json')
    assert response.status_code == 400
    assert lists_of_dicts_equalled(response.data['warnings'], FAIL_SAMPLE['output']['warnings'])
    assert lists_of_dicts_equalled(response.data['errors'], FAIL_SAMPLE['output']['errors'])

    assert frozenset(response.data['data'].items()) == frozenset(FAIL_SAMPLE['output']['data'].items())


def test_put_given_valid_data_expect_200_product_changed(admin_logged_client, merchant, product_with_default_cat):
    response = admin_logged_client.put(
        reverse('api:catalog:products-detail', args=(merchant.id, product_with_default_cat.id)),
        data=json.dumps(SUCCESS_SAMPLE), content_type='application/json')
    assert response.status_code == 200
    assert Product.objects.get(id=product_with_default_cat.id).name == SUCCESS_SAMPLE['name']
