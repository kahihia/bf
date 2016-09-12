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


def test_generic_validator_call_expect_validate_called():
    fake_rule = MagicMock()
    GenericValidator(fake_rule)({'context': 'context'}, foo='foo', bar='bar')
    fake_rule.assert_called_with(context={'context': 'context'}, foo='foo', bar='bar')
