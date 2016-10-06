from django.conf import settings


SUCCESS_DATA = {
    'input': {
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
        [
            {'field': 'currency', 'message': 'Значение должно соответствовать одному из rur, usd, uah, kzt'},
            {'field': 'start_price', 'message': 'Отсутствует числовое значение'},
            {'field': 'image', 'message': "Строка должна содержать ('http://', 'https://')"}
        ],
        [
            {'field': 'price', 'message': 'Старая цена больше новой'},
            {'field': 'old_price', 'message': 'Старая цена больше новой'},
            {'field': 'url', 'message': 'Отсутствуют utm метки'}
        ]
    )
}
