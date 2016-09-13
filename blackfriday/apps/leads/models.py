from django.db import models


class Subscriber(models.Model):
    name = models.CharField(max_length=255, null=True, blank=True, verbose_name='Имя')
    email = models.EmailField(max_length=255, verbose_name='E-mail')

    class Meta:
        verbose_name = 'Подписчик'
        verbose_name_plural = 'Подписчики'

    def __str__(self):
        return self.email


class AdvertiserRequestStatus:
    new = 0
    accepted = 1
    rejected = 2


class AdvertiserRequest(models.Model):
    REQUEST_STATUSES = (
        (AdvertiserRequestStatus.new, 'Новая'),
        (AdvertiserRequestStatus.accepted, 'Принята'),
        (AdvertiserRequestStatus.rejected, 'Отклонена')
    )

    name = models.CharField(max_length=255, verbose_name='Имя')
    organization_name = models.CharField(max_length=255, verbose_name='Название организации')
    phone = models.CharField(max_length=255, verbose_name='Телефон')
    email = models.EmailField(max_length=255, unique=True, verbose_name='E-mail')
    comment = models.TextField(blank=True, null=True, verbose_name='Комментарии')
    status = models.IntegerField(default=AdvertiserRequestStatus.new, choices=REQUEST_STATUSES, verbose_name='Статус')
    datetime_created = models.DateTimeField(auto_now_add=True, verbose_name='Время создания')
    datetime_updated = models.DateTimeField(auto_now=True, verbose_name='Время изменения')

    class Meta:
        verbose_name = 'Заявка от рекламодателя'
        verbose_name_plural = 'Заявки от рекламодателей'

    def __str__(self):
        return self.organization_name
