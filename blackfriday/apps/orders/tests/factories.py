import factory


class InvoiceFactory(factory.django.DjangoModelFactory):

    merchant = factory.SubFactory('apps.advertisers.tests.factories.MerchantFactory')
    is_paid = False

    @factory.post_generation
    def options(obj, create, extracted, **kwargs):
        if not create:
            return
        if extracted is not None:
            if isinstance(extracted, list):
                for option in extracted:
                    InvoiceOptionFactory.create(option=option, invoice=obj, **kwargs)
            else:
                InvoiceOptionFactory.create(option=extracted, invoice=obj, **kwargs)
        elif kwargs:
            InvoiceOptionFactory.create(invoice=obj, **kwargs)

    class Meta:
        model = 'orders.Invoice'


class InvoiceOptionFactory(factory.django.DjangoModelFactory):
    invoice = factory.SubFactory(InvoiceFactory)
    option = factory.SubFactory('apps.promo.tests.factories.OptionFactory')

    value = 1
    price = 42

    class Meta:
        model = 'orders.InvoiceOption'
