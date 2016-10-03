import factory

from apps.leads.models import AdvertiserRequestStatus


class AdvertiserRequestFactory(factory.django.DjangoModelFactory):
    name = factory.Faker('name')
    organization_name = factory.Faker('company')
    phone = factory.Faker('phone_number')
    email = factory.Faker('email')
    user_responsible = None
    status = AdvertiserRequestStatus.new

    class Meta:
        model = 'leads.AdvertiserRequest'
