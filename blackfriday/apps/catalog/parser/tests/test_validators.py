from unittest.mock import patch, MagicMock

from ..validators import BaseValidator, GenericValidator


def test_call_expect_call_validate():
    with patch.object(BaseValidator, 'validate') as fake_validate:
        BaseValidator()('value', {'context': 'context'})
        fake_validate.assert_called_with(value='value', context={'context': 'context'})


def test_call_given_none_value_expect_return_none():
    with patch.object(BaseValidator, 'validate') as fake_validate:
        assert BaseValidator()(None, {'context': 'context'}) is None
        assert not fake_validate.called


def test_message_expect_get_message_called():
    with patch.object(BaseValidator, 'get_message', return_value='foo') as fake_get_message:
        assert BaseValidator().message == 'foo'
        assert fake_get_message.called


def test_message_expect_get_message_not_called():
    with patch.object(BaseValidator, 'get_message') as fake_get_message:
        assert BaseValidator(message='foo').message == 'foo'
        assert not fake_get_message.called


def test_generic_validator_call_given_func_no_context_expect_rule_called_without_context():
    global called, call_args
    called = False
    call_args = ()

    def fake_rule(foo, bar):
        global called, call_args
        called = True
        call_args = (foo, bar)
    GenericValidator(fake_rule)('context', foo='foo', bar='bar')
    assert called
    assert call_args == ('foo', 'bar')


def test_generic_validator_call_given_func_with_context_expect_rule_called_with_context():
    global called, call_args
    called = False

    def fake_rule(context, foo, bar):
        global called, call_args
        called = True
        call_args = (context, foo, bar)
    GenericValidator(fake_rule)('context', foo='foo', bar='bar')
    assert called
    assert call_args == ('context', 'foo', 'bar')
