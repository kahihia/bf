from unittest.mock import MagicMock, patch
from apps.catalog.utils import csv_dict_reader


def pytest_generate_tests(metafunc):
    idlist = []
    argvalues = []
    for scenario in metafunc.cls.scenarios:
        idlist.append(scenario[0])
        items = scenario[1].items()
        argnames = [x[0] for x in items]
        argvalues.append(([x[1] for x in items]))
    metafunc.parametrize(argnames, argvalues, ids=idlist, scope="class")


empty = (
    'empty',
    {
        'input': [
            {'invalid_key': 'foo'}
        ],
        'output': [
            {
                'name': None,
                'old_price': None,
                'price': None,
                'discount': None,
                'start_price': None,
                'currency': None,
                'brand': None,
                'category': None,
                'country': None,
                'url': None,
                'image': None,
            }
        ]
    }
)

transformed_keys = (
    'transformed_keys',
    {
        'input': [
            {
                'name': 'foo',
                'oldPrice': 'foo',
                'price': 'foo',
                'discount': 'foo',
                'startPrice': 'foo',
                'currencyId': 'foo',
                'vendor': 'foo',
                'CATEGORY': 'foo',
                'countryoforigin': 'foo',
                'url': 'foo',
                'image': 'foo',
            }
        ],
        'output': [
            {
                'name': 'foo',
                'old_price': 'foo',
                'price': 'foo',
                'discount': 'foo',
                'start_price': 'foo',
                'currency': 'foo',
                'brand': 'foo',
                'category': 'foo',
                'country': 'foo',
                'url': 'foo',
                'image': 'foo',
            }
        ]
    }
)


class TestReadersByScenario:
    scenarios = [empty, transformed_keys]

    def test_csv_reader(self, input, output):
        with patch('apps.catalog.utils.DictReader') as fakeDictReader:
            fakeDictReader.return_value = input
            fake_file = MagicMock(**{'read.return_value.decode.return_value': 'foo'})
            assert list(csv_dict_reader(fake_file)) == output

    # TODO: add fixtures with xlsx files
