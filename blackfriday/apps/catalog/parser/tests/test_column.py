import pytest
from unittest.mock import patch

from ..rows import Column
from ..validators import GenericValidator, BaseValidator


def test_clean_value_given_none_return_none():
    assert Column('foo').clean_value(None, {}) is None


def test_clean_value_given_pipes_with_context_expect_called_with_context():
    def func_with_context(value, context=None):
        global called
        called = True
    Column('foo', pipes=(func_with_context, )).clean_value('foo', {})
    assert called


def test_clean_value_given_pipes_without_context_expect_pipe_called_no_context():
    def func_no_context(value):
        global called
        called = True
    Column('foo', pipes=(func_no_context, )).clean_value('foo', {})
    assert called


def test_clean_value_expect_lowercase_value():
    assert Column('foo', pipes=(str.lower,)).clean_value('FOO', {}) == 'foo'


def test_validate_given_validator_return_true_expects_no_errors(positive_validator):
    with patch.object(Column, 'clean_value', return_value='foo') as fake_clean_value:
        assert (
            Column('foo', validators=(positive_validator,)).validate({'foo': 'foo'}, {}) == (
                {'foo': 'foo'}, [], [])
        )
    assert fake_clean_value.called
    assert positive_validator.called


def test_validate_given_validator_return_false_expects_errors(negative_validator):
    with patch.object(Column, 'clean_value', return_value='foo') as fake_clean_value:
        assert (
            Column('foo', validators=(negative_validator,)).validate({'foo': 'foo'}, {}) == (
                {'foo': 'foo'}, [{'field': 'foo', 'message': negative_validator.message}], [])
        )
    assert fake_clean_value.called
    assert negative_validator.called


def test_validate_given_validator_return_false_expects_warnings(negative_validator):
    negative_validator.is_warning = True
    with patch.object(Column, 'clean_value', return_value='foo') as fake_clean_value:
        assert (
            Column('foo', validators=(negative_validator,)).validate({'foo': 'foo'}, {}) == (
                {'foo': 'foo'}, [], [{'field': 'foo', 'message': negative_validator.message}])
        )
    assert fake_clean_value.called
    assert negative_validator.called


def test_validate_given_generic_validator_expect_called_with_dict():
    global called, call_args
    called = False
    call_args = None

    def validator_rule(foo):
        global called, call_args
        called = True
        call_args = foo
        return True

    validator = GenericValidator(validator_rule)

    Column('foo', validators=(validator,)).validate({'foo': 'foo', 'bar': 'bar'}, {})

    assert called
    assert call_args == 'foo'


def test_validate_given_simple_validator_expect_called_with_args():
    global called, call_args
    called = False
    call_args = None

    class FooValidator(BaseValidator):
        _message = 'foo'

        def validate(self, value, context):
            global called, call_args
            called = True
            call_args = value
            return True

    Column('foo', validators=(FooValidator(),)).validate({'foo': 'foo', 'bar': 'bar'}, {})

    assert called
    assert call_args == 'foo'
