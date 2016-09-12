
import pytest
from unittest.mock import MagicMock
from ..rows import Row


@pytest.fixture
def valid_fake_column():
    return MagicMock(**{'validate.return_value': ({'foo': 'foo'}, [], [])})


@pytest.fixture
def dummy_row_class(valid_fake_column):
    class DummyRow(Row):
        _columns = (
            valid_fake_column,
        )
    return DummyRow
