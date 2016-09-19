import pytest
from . import UserFactory


@pytest.fixture
def admin_user():
    return UserFactory.create(create_profile=False, is_admin=True)


@pytest.fixture
def admin_logged_client(client, admin_user):
    client.login(username=admin_user.email, password='password')
    return client
