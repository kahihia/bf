from django.db import models

from libs.db.fields import ResizedImageField, upload_to


class LandingLogo(models.Model):
    image = ResizedImageField(
        upload_to=upload_to('landing-logos'), quality=100, size=[210, 130], verbose_name='Изображение')
    url = models.URLField(verbose_name='URL')
    position = models.PositiveSmallIntegerField(null=True)

    class Meta:
        ordering = ['position']
