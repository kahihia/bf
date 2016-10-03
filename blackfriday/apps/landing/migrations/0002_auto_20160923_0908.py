# -*- coding: utf-8 -*-
# Generated by Django 1.10.1 on 2016-09-23 09:08
from __future__ import unicode_literals

from django.db import migrations
import libs.db.fields


class Migration(migrations.Migration):

    dependencies = [
        ('landing', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='landinglogo',
            name='image',
            field=libs.db.fields.ResizedImageField(upload_to='landing-logos', verbose_name='Изображение'),
        ),
    ]
