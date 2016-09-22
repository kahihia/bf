import factory

from apps.users.models import Role


class UserFactory(factory.django.DjangoModelFactory):
    create_profile = True
    is_active = True

    email = factory.Sequence(lambda n: 'person{0}@example.com'.format(n))
    name = factory.Faker('name')

    _role = Role.MANAGER

    datetime_created = factory.Faker('date_time_this_month')
    datetime_updated = factory.Faker('date_time_this_month')

    class Meta:
        model = 'users.User'

    class Params:
        create_profile = factory.Trait(
            profile=factory.SubFactory('apps.advertisers.tests.factories.AdvertiserProfileFactory'),
        )

    @factory.post_generation
    def set_password(obj, create, extracted, **kwargs):
        if not create:
            return
        obj.set_password('password')
        obj.save()
