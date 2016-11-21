import io
import os
from functools import partial
import uuid

from PIL import Image, ImageFile

from django.db.models import ImageField, TextField, validators
from django.core.files.base import ContentFile

from rest_framework.exceptions import ValidationError


class LongUrlField(TextField):
    default_validators = [validators.URLValidator()]
    description = 'URL'


class ResizedImageFieldFile(ImageField.attr_class):
    def save(self, name, content, save=True):
        content.file.seek(0)

        img = Image.open(content.file)
        if img.format not in ('PNG', 'JPEG'):
            raise ValidationError('Неподдерживаемый формат изображения')

        img.thumbnail(self.field.size, Image.ANTIALIAS)

        ImageFile.MAXBLOCK = max(ImageFile.MAXBLOCK, img.size[0] * img.size[1])

        new_content = io.BytesIO()
        img.save(new_content, format=img.format, quality=self.field.quality, **img.info)

        new_content = ContentFile(new_content.getvalue())
        super(ResizedImageFieldFile, self).save(name, new_content, save)


class ResizedImageField(ImageField):
    attr_class = ResizedImageFieldFile

    def __init__(self, verbose_name=None, name=None, **kwargs):
        self.size = kwargs.pop('size', [255, 255])
        self.quality = kwargs.pop('quality', 80)
        super(ResizedImageField, self).__init__(verbose_name, name, **kwargs)


def _update_filename(instance, filename, path):
    return os.path.join(path, str(uuid.uuid4()))


def upload_to(path):
    return partial(_update_filename, path=path)
