# -*- coding: utf-8 -*-
# Generated by Django 1.10.1 on 2016-10-25 08:59
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('advertisers', '0015_auto_20161020_1538'),
    ]

    operations = [
        migrations.AddField(
            model_name='merchant',
            name='receives_notifications',
            field=models.BooleanField(default=False, verbose_name='Получает уведомления'),
        ),
    ]