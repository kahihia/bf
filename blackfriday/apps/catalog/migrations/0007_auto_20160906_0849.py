# -*- coding: utf-8 -*-
# Generated by Django 1.10.1 on 2016-09-06 08:49
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('catalog', '0006_auto_20160902_1423'),
    ]

    operations = [
        migrations.AlterField(
            model_name='product',
            name='is_teaser',
            field=models.BooleanField(default=False, verbose_name='Товар является тизером'),
        ),
        migrations.AlterField(
            model_name='product',
            name='is_teaser_on_main',
            field=models.BooleanField(default=False, verbose_name='Товар является тизером на главной'),
        ),
        migrations.AlterField(
            model_name='product',
            name='name',
            field=models.CharField(max_length=120, verbose_name='Название'),
        ),
    ]
