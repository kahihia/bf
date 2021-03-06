import pytest


from unittest.mock import patch
from libs.testing.helpers import lists_of_dicts_equalled, pytest_generate_tests

from apps.catalog.feeds.verifier import ProductRow
from .fixtures import FAIL_DATA, SUCCESS_DATA, FAIL_DATA_NO_PRICES


@pytest.fixture
def context_fixture():
    return {
        'product_urls': set(),
        'categories': ['correct_category_name']
    }


class TestProductRow:
    scenarios = [
        ('perfect', SUCCESS_DATA),
        ('failed errors and warnings', FAIL_DATA),
        ('failed by no prices', FAIL_DATA_NO_PRICES)
    ]

    def test_validate_scenario(self, fake_image_response, context_fixture, input, output):
        with patch('requests.head', return_value=fake_image_response):
            expected_data, expected_errors, expected_warnings = output
            cleaned_data, errors, warnings = ProductRow(row=input, context=context_fixture).validate()
            assert cleaned_data == expected_data
            assert lists_of_dicts_equalled(errors, expected_errors)
            assert lists_of_dicts_equalled(warnings, expected_warnings)
