import pytest
from apps.users.models import Role

from . import UserFactory


@pytest.fixture
def admin_user():
    return UserFactory.create(create_profile=False, _role=Role.ADMIN)


@pytest.fixture
def admin_logged_client(client, admin_user):
    client.login(username=admin_user.email, password='password')
    return client


@pytest.fixture
def operator_user():
    return UserFactory.create(create_profile=False, _role=Role.OPERATOR)


@pytest.fixture
def operator_logged_client(client, operator_user):
    client.login(username=operator_user.email, password='password')
    return client
