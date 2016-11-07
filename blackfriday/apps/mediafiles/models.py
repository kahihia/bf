from django.db import models
from libs.db.fields import upload_to


class Image(models.Model):
    image = models.ImageField(upload_to=upload_to('images/'))

    def __str__(self):
        return self.image.url
