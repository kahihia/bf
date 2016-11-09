import pytest
from apps.users.tests.fixtures import *
from apps.catalog.feeds.tests.fixtures import *
from apps.advertisers.tests.fixtures import *
from apps.mediafiles.tests.fixtures import *


@pytest.fixture(autouse=True)
def no_camelcase_in_verifier_errors(monkeypatch):
    monkeypatch.setattr(
        'apps.catalog.parser.rows.camelcase_error_output',
        lambda field, message: {'field': field, 'message': message}
    )
