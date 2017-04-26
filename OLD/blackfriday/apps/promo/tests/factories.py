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


class PromoFactory(factory.django.DjangoModelFactory):
    name = factory.Sequence(lambda n: 'promo name {}'.format(n))
    price = 42
    is_custom = False

    @factory.post_generation
    def options(obj, create, extracted, **kwargs):
        if not create:
            return
        if extracted is not None:
            if isinstance(extracted, list):
                for option in extracted:
                    PromoOptionFactory.create(option=option, promo=obj, **kwargs)
            else:
                PromoOptionFactory.create(option=extracted, promo=obj, **kwargs)
        elif kwargs:
            PromoOptionFactory.create(promo=obj, **kwargs)

    class Meta:
        model = 'promo.promo'

    def __str__(self):
        return self.name


class PromoOptionFactory(factory.django.DjangoModelFactory):
    promo = factory.SubFactory(PromoFactory)
    option = factory.SubFactory(OptionFactory)
    value = 2

    class Meta:
        model = 'promo.PromoOption'
