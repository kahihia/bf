import pytest

from libs.testing.helpers import lists_of_dicts_equalled

from ..verifier import ProductRow
from .fixtures import FAIL_DATA, SUCCESS_DATA


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


perfect = ('perfect', SUCCESS_DATA)

fail_with_warnings = ('failed errors and warnings', FAIL_DATA)


class TestProductRow:
    scenarios = [perfect, fail_with_warnings]

    def test_validate_scenario(self, context_fixture, input, output):
        expected_data, expected_errors, expected_warnings = output
        cleaned_data, errors, warnings = ProductRow(row=input, context=context_fixture).validate()
        assert cleaned_data == expected_data
        assert lists_of_dicts_equalled(errors, expected_errors)
        assert lists_of_dicts_equalled(warnings, expected_warnings)
