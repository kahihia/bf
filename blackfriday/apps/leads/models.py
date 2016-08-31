from django.db import models


class Subscriber(models.Model):
    name = models.CharField(max_length=120, null=True, blank=True, verbose_name='Имя')
    email = models.EmailField(verbose_name='E-mail')

    class Meta:
        verbose_name = 'Подписчик'
        verbose_name_plural = 'Подписчики'

    def __str__(self):
        return self.email
