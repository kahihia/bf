# -*- coding: utf-8 -*-
# Generated by Django 1.10.1 on 2016-09-02 14:23
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('catalog', '0005_auto_20160902_1422'),
    ]

    operations = [
        migrations.AlterField(
            model_name='product',
            name='discount',
            field=models.IntegerField(null=True, verbose_name='Скидка'),
        ),
        migrations.AlterField(
            model_name='product',
            name='old_price',
            field=models.IntegerField(null=True, verbose_name='Старая цена'),
        ),
        migrations.AlterField(
            model_name='product',
            name='price',
            field=models.IntegerField(null=True, verbose_name='Цена'),
        ),
        migrations.AlterField(
            model_name='product',
            name='start_price',
            field=models.IntegerField(null=True, verbose_name='Цена от'),
        ),
    ]
