# -*- coding: utf-8 -*-
# Generated by Django 1.10.1 on 2016-09-02 13:55
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('advertisers', '0004_merge_20160831_1300'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='merchant',
            options={'verbose_name': 'Магазин', 'verbose_name_plural': 'Магазины'},
        ),
    ]
