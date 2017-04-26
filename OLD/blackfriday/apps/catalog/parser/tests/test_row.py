from ..rows import Row


def test_row_expect_row_attrs_lowercase():
    assert Row({'FOO': 'foo'}, {})._row == {'foo': 'foo'}


def test_row_validate_expect_columns_validate_called(dummy_row_class):
    _row = {'foo': 'foo'}
    assert dummy_row_class(_row, {}).validate() == (_row, [], [])
