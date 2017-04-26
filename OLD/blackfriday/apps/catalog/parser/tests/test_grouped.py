from unittest.mock import MagicMock
from ..rows import Grouped


def test_validate_expect_call_validate_on_columns(valid_fake_column):
    row = {'foo': 'foo', 'bar': 'bar'}
    context = {'context': 'context'}

    assert Grouped(validators=[], columns=[valid_fake_column]).validate(row, context) == ({'foo': 'foo'}, [], [])

    valid_fake_column.validate.assert_called_with(row, context=context)


def test_validate_expect_call_validators(valid_fake_column):
    row = {'foo': 'foo', 'bar': 'bar'}
    context = {'context': 'context'}

    validator = MagicMock(return_value=True)

    assert (
        Grouped(validators=[validator], columns=[valid_fake_column]).validate(row, context) ==
        ({'foo': 'foo'}, [], []))

    validator.assert_called_with(**{'foo': 'foo'}, context=context)
