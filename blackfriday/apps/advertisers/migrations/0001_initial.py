# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2016-08-23 11:58
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='AdvertiserProfile',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('account', models.CharField(blank=True, max_length=20, null=True, verbose_name='Банковский счет')),
                ('inn', models.CharField(blank=True, max_length=12, null=True, verbose_name='ИНН')),
                ('bik', models.CharField(blank=True, max_length=9, null=True, verbose_name='БИК')),
                ('kpp', models.CharField(blank=True, max_length=9, null=True, verbose_name='КПП')),
                ('okpo', models.CharField(blank=True, max_length=10, null=True, verbose_name='ОКПО')),
                ('address', models.CharField(blank=True, max_length=250, null=True, verbose_name='Адрес')),
                ('legal_address', models.CharField(blank=True, max_length=250, null=True, verbose_name='Юридический адрес')),
                ('contact_name', models.CharField(blank=True, max_length=100, null=True, verbose_name='Контактное лицо')),
                ('contact_phone', models.CharField(blank=True, max_length=32, null=True, verbose_name='Телефон контактного лица')),
            ],
            options={
                'verbose_name': 'Профиль рекламодателя',
                'verbose_name_plural': 'Профили рекламодателей',
            },
        ),
    ]