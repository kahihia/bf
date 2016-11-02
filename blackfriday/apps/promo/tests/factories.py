import factory


class OptionFactory(factory.django.DjangoModelFactory):
    name = factory.Sequence(lambda n: 'option name {}'.format(n))
    tech_name = factory.Sequence(lambda n: 'option tech name {}'.format(n))

    price = 42
    max_count = None

    is_required = False
    is_boolean = False

    class Meta:
        model = 'promo.Option'
