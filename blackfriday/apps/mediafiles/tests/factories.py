import factory


class ImageFactory(factory.django.DjangoModelFactory):
    image = factory.django.ImageField()

    class Meta:
        model = 'mediafiles.Image'
