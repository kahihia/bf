from django.db import models
from django.core.exceptions import ValidationError
from django.conf import settings


def validate_file_extension(value):
    if not value.name.split('.')[-1].lower() in settings.SPECIAL_SUPPORTED_FORMATS:
        raise ValidationError(u'Unsupported file extension.')


class Special(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    document = models.FileField(upload_to='specials', validators=[validate_file_extension])

    def __str__(self):
        return self.name
