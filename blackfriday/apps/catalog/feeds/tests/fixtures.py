import pytest

from requests import Response
from django.conf import settings

SUCCESS_DATA = {
    'input': {
        "_id": 12,
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
    },
    'output': (
        {
            "_id": 12,
            "category": "correct_category_name",
            "name": "name",
            "image": "http://image.com",
            "price": 100,
            "start_price": 100,
            "old_price": 101,
            "discount": 20,
            "country": "country",
            "brand": "Brand",
            "url": "http://product_url--utm_source--utm_medium--utm_campaign",
            "currency": "rur"
        },
        [],
        []
    )
}

FAIL_DATA = {
    'input': {
        "_id": 32,
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
    'output': (
        {
            "_id": 32,
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
            "currency": "rur"
        },
        [
            {'field': 'start_price', 'message': 'Отсутствует числовое значение'},
            {'field': 'image', 'message': "Строка должна содержать ('http://', 'https://')"}
        ],
        [
            {'field': 'price', 'message': 'Старая цена должна быть больше новой'},
            {'field': 'old_price', 'message': 'Старая цена должна быть больше новой'},
            {'field': 'url', 'message': 'Отсутствуют utm метки'}
        ]
    )
}


FAIL_DATA_NO_PRICES = {
    'input': {
        "_id": 12,
        "category": "correct_category_name",
        "name": "name",
        "image": "http://image.com",
        "price": None,
        "start_price": None,
        "old_price": None,
        "discount": None,
        "country": "Country",
        "brand": "Brand",
        "url": "http://product_url--utm_source--utm_medium--utm_campaign",
        "currency": "rur"
    },
    'output': (
        {
            "_id": 12,
            "category": "correct_category_name",
            "name": "name",
            "image": "http://image.com",
            "price": None,
            "start_price": None,
            "old_price": None,
            "discount": None,
            "country": "country",
            "brand": "Brand",
            "url": "http://product_url--utm_source--utm_medium--utm_campaign",
            "currency": "rur"
        },
        [
            {'field': 'price', 'message': 'Укажите хотя бы одну цену'},
            {'field': 'old_price', 'message': 'Укажите хотя бы одну цену'},
            {'field': 'start_price', 'message': 'Укажите хотя бы одну цену'},
            {'field': 'discount', 'message': 'Укажите хотя бы одну цену'},
        ],
        []
    )
}


@pytest.fixture
def fake_image_response():
    fake_response = Response()
    fake_response.status_code = 200
    fake_response.headers = {'Content-Type': 'image/jpeg'}
    return fake_response
