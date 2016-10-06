from ..validators import IsNumeric, MaxValue, Choices, Substring, Length, Required, UtmRequired


def test_is_numeric_given_non_numeric_expect_false():
    assert not IsNumeric().validate('foo')


def test_is_numeric_given_numeric_str_expect_false():
    assert IsNumeric().validate('123')


def test_max_value_given_str_expect_none():
    assert MaxValue(20).validate('sasd') is None


def test_max_value_given_invalid_number_expect_false():
    assert not MaxValue(20).validate(21)


def test_max_value_given_valid_number_expect_true():
    assert MaxValue(20).validate(19)


def test_choices_given_invalid_element_expect_false():
    assert not Choices((2, 3, 4)).validate(1)


def test_choices_given_valid_element_expect_true():
    assert Choices((2, 3, 4)).validate(2)


def test_substring_given_str_rule_invalid_char_expect_false():
    assert not Substring('foo').validate('bar')


def test_substring_given_str_rule_valid_char_expect_true():
    assert Substring('foo').validate('foobar')


def test_substring_given_collection_rule_invalid_char_expect_false():
    assert not Substring(('foo', 'bar')).validate('fuu')


def test_substring_given_collection_rule_valid_char_expect_true():
    assert Substring(('foo', 'bar')).validate('bar')


def test_length_given_invalid_str_expect_false():
    assert not Length(2).validate('2' * 3)


def test_length_given_valid_str_expect_true():
    assert Length(2).validate('2' * 2)


def test_required_given_invalid_arg_expect_false():
    assert not Required().validate('')


def test_required_given_valid_arg_expect_true():
    assert Required().validate('true')


def test_utm_required_given_invalid_str_expect_false():
    assert not UtmRequired().validate('foo')


def test_utm_required_given_valid_string_expect_true():
    assert UtmRequired().validate('utm_sourcefooooooutm_mediumbaaaarutm_campaign')
