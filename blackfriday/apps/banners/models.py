from django.db import models
from libs.db.fields import upload_to


class Partner(models.Model):
    name = models.CharField(max_length=120, unique=True, verbose_name='Название')
    url = models.URLField(max_length=160, verbose_name='URL')
    image = models.ImageField(max_length=250, upload_to=upload_to('partners'), verbose_name='Изображение')

    class Meta:
        verbose_name = 'Партнер'
        verbose_name_plural = 'Партнеры'

    def __str__(self):
        return self.name
