# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2016-08-23 11:58
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='profile',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='advertisers.AdvertiserProfile', verbose_name='Профиль рекламодателя'),
        ),
        migrations.DeleteModel(
            name='Advertiser',
        ),
    ]
