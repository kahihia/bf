from unittest.mock import MagicMock, patch

from ..rows import Column


def test_clean_value_given_none_return_none():
    assert Column('foo').clean_value(None, {}) is None


def test_clean_value_given_pipes_with_context_expect_called_with_context():
    def func_with_context(value, context=None):
        assert context is not None
    Column('foo', pipes=(func_with_context, )).clean_value('foo', {})


def test_clean_value_given_pipes_without_context_expect_pipe_called_no_context():
    def func_no_context(value, context=None):
        assert context is None
    Column('foo', pipes=(func_no_context, )).clean_value('foo', {})


def test_clean_value_expect_lowercase_value():
    assert Column('foo', pipes=(str.lower,)).clean_value('FOO', {}) == 'foo'


def test_validate_given_validator_return_true_expects_no_errors():
    fake_validator = MagicMock(return_value=True)
    with patch.object(Column, 'clean_value', return_value='foo') as fake_clean_value:
        assert (
            Column('foo', validators=(fake_validator,)).validate({'foo': 'foo'}, {}) == (
                {'foo': 'foo'}, [], [])
        )
    assert fake_clean_value.called
    assert fake_validator.called


def test_validate_given_validator_return_false_expects_errors():
    fake_validator = MagicMock(return_value=False, message='bar', is_warning=False)
    with patch.object(Column, 'clean_value', return_value='foo') as fake_clean_value:
        assert (
            Column('foo', validators=(fake_validator,)).validate({'foo': 'foo'}, {}) == (
                {'foo': 'foo'}, [{'field': 'foo', 'message': 'bar'}], [])
        )
    assert fake_clean_value.called
    assert fake_validator.called


def test_validate_given_validator_return_false_expects_warnings():
    fake_validator = MagicMock(return_value=False, message='bar', is_warning=True)
    with patch.object(Column, 'clean_value', return_value='foo') as fake_clean_value:
        assert (
            Column('foo', validators=(fake_validator,)).validate({'foo': 'foo'}, {}) == (
                {'foo': 'foo'}, [], [{'field': 'foo', 'message': 'bar'}])
        )
    assert fake_validator.called
    assert fake_clean_value.called
