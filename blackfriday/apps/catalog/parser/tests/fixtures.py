
import pytest
from unittest.mock import MagicMock
from ..rows import Row
from ..validators import BaseValidator


@pytest.fixture
def positive_validator():
    class PositiveValidator(BaseValidator):
        _message = 'message'
        called = False
        called_args = None

        def validate(self, value, context):
            self.called = True
            self.called_args = (value, context)
            return True
    return PositiveValidator()


@pytest.fixture
def negative_validator():
    class NegativeValidator(BaseValidator):
        _message = 'message'
        called = False
        called_args = None

        def validate(self, value, context):
            self.called = True
            self.called_args = (value, context)
            return False
    return NegativeValidator()


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
