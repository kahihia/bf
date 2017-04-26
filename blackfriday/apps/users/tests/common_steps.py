from pytest_bdd import given, parsers
from apps.users.tests.factories import UserFactory
from apps.users.models import Role


@given(parsers.parse('I am an {role}'))
def user(role):
    return UserFactory.create(create_profile=role == 'advertiser', _role=Role.get(role))


@given('I am logged in')
def client(client, user):
    client.force_login(user)
    return client
