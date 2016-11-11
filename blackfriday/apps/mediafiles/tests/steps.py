from pytest_bdd import given, parsers

from .factories import ImageFactory


@given(parsers.parse('there is uploaded image in system with id={image_id:d}'), target_fixture='uploaded_image')
def moderated_image_with_id(user, image_id):
    return uploaded_image(image_id)


@given('there is uploaded image in system with id=<image_id>')
def uploaded_image(image_id):
    return ImageFactory.create(id=image_id)
