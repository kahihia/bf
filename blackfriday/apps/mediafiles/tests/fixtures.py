import pytest

from pytest_bdd import given

from .factories import ImageFactory


@given('there is uploaded image in system with id=<image_id>')
@pytest.fixture
def uploaded_image(image_id):
    return ImageFactory.create(id=image_id)
