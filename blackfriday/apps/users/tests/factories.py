import factory


class UserFactory(factory.django.DjangoModelFactory):
    create_profile = True
    email = factory.Sequence(lambda n: 'person{0}@example.com'.format(n))
    name = factory.Faker('name')

    datetime_created = factory.Faker('date_time_this_month')
    datetime_updated = factory.Faker('date_time_this_month')

    @factory.post_generation
    def set_password(obj, create, extracted, **kwargs):
        if not create:
            return
        obj.set_password('password')
        obj.save()

    class Params:
        create_profile = factory.Trait(
            profile=factory.SubFactory('apps.advertisers.tests.factories.AdvertiserProfileFactory'),
        )

    is_active = True
    is_admin = False

    class Meta:
        model = 'users.User'
