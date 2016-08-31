from django.db import models


class HeadBasis:
    charter = 0
    proxy = 1


class AdvertiserProfile(models.Model):
    HEAD_BASISES = (
        (HeadBasis.charter, 'На основании устава'),
        (HeadBasis.proxy, 'На основании доверенности')
    )

    account = models.CharField(max_length=20, null=True, blank=True, verbose_name='Банковский счет')
    inn = models.CharField(max_length=12, null=True, blank=True, verbose_name='ИНН')
    bik = models.CharField(max_length=9, null=True, blank=True, verbose_name='БИК')
    kpp = models.CharField(max_length=9, null=True, blank=True, verbose_name='КПП')
    korr = models.CharField(max_length=20, null=True, blank=True, verbose_name='Корр. счет')
    bank = models.CharField(max_length=100, null=True, blank=True, verbose_name='Банк')
    address = models.CharField(max_length=250, null=True, blank=True, verbose_name='Адрес')
    legal_address = models.CharField(max_length=250, null=True, blank=True, verbose_name='Юридический адрес')
    contact_name = models.CharField(max_length=100, null=True, blank=True, verbose_name='Контактное лицо')
    contact_phone = models.CharField(max_length=32, null=True, blank=True, verbose_name='Телефон контактного лица')
    head_name = models.CharField(max_length=100, null=True, blank=True, verbose_name='ФИО руководителя')
    head_appointment = models.CharField(max_length=250, null=True, blank=True, verbose_name='Должность руковолителя')
    head_basis = models.IntegerField(null=True, blank=True, choices=HEAD_BASISES,
                                     verbose_name='На основании чего действует руководитель')

    class Meta:
        verbose_name = 'Профиль рекламодателя'
        verbose_name_plural = 'Профили рекламодателей'
