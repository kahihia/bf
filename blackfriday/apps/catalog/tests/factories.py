import factory


class CategoryFactory(factory.django.DjangoModelFactory):
    name = factory.Sequence(lambda n: 'category {}'.format(n))
    slug = factory.Sequence(lambda n: 'category slug {}'.format(n))
    id = factory.Sequence(lambda n: n)

    class Meta:
        model = 'catalog.Category'


class ProductFactory(factory.django.DjangoModelFactory):
    merchant = factory.SubFactory('apps.advertisers.tests.factories.MerchantFactory')
    category = factory.SubFactory(CategoryFactory)
    name = factory.Sequence(lambda n: 'product {}'.format(n))
    country = factory.Faker('country')
    is_teaser = False
    is_teaser_on_main = False
    brand = 'Brand'
    url = factory.Sequence(lambda n: 'http://lol.com/{}'.format(n))
    created_datetime = factory.Faker('date_time_this_month')
    image = factory.django.ImageField()
    currency = 'rur'

    class Meta:
        model = 'catalog.Product'
