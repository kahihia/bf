from pytest_bdd import given
from libs.testing.parsers import AsciiTableParser

from .factories import CategoryFactory


@given(AsciiTableParser('there are categories with:\n{data}'))
def categories(data):
    return [CategoryFactory.create(**row) for row in data]
