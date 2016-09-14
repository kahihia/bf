import pytest
from ..verifier import ProductRow
from django.conf import settings


def pytest_generate_tests(metafunc):
    idlist = []
    argvalues = []
    for scenario in metafunc.cls.scenarios:
        idlist.append(scenario[0])
        items = scenario[1].items()
        argnames = [x[0] for x in items]
        argvalues.append(([x[1] for x in items]))
    metafunc.parametrize(argnames, argvalues, ids=idlist, scope="class")


@pytest.fixture
def context_fixture():
    return {
        'product_urls': set(),
        'categories': ['correct_category_name']
    }


perfect = (
    'perfect',
    {
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
)

fail_with_warnings = (
    'failed errors and warnings',
    {
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
)


class TestProductRow:
    scenarios = [perfect, fail_with_warnings]

    def test_validate_scenario(self, context_fixture, input, output):
        expected_data, expected_errors, expected_warnings = output
        cleaned_data, errors, warnings = ProductRow(row=input, context=context_fixture).validate()
        assert cleaned_data == expected_data
        assert {frozenset(i.items()) for i in errors} == {frozenset(i.items()) for i in expected_errors}
        assert {frozenset(i.items()) for i in warnings} == {frozenset(i.items()) for i in expected_warnings}
