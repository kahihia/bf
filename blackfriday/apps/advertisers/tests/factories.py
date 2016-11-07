import factory


class AdvertiserProfileFactory(factory.django.DjangoModelFactory):
    account = factory.Faker('credit_card_number')
    inn = factory.Sequence(lambda n: n)
    bik = factory.Faker('ean8')
    kpp = factory.Faker('ean8')
    korr = factory.Faker('ean8')
    bank = 'Сбербанк'
    address = factory.Faker('street_name')
    legal_address = factory.Faker('street_name')
    contact_name = factory.Faker('name')
    contact_phone = factory.Faker('phone_number')
    head_name = factory.Faker('name')

    class Meta:
        model = 'advertisers.AdvertiserProfile'


class MerchantFactory(factory.django.DjangoModelFactory):
    name = factory.Sequence(lambda n: 'merchant {}'.format(n))
    image = factory.SubFactory('apps.mediafiles.tests.factories.ImageFactory')
    advertiser = factory.SubFactory('apps.users.tests.factories.UserFactory')
    is_active = True
    banner_mailings_count = 0
    moderation_status = 2

    class Meta:
        model = 'advertisers.Merchant'
