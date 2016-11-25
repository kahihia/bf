# -*- coding: utf-8 -*-
# Generated by Django 1.10.3 on 2016-11-22 10:16
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('advertisers', '0021_auto_20161116_1218'),
        ('reports', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='MerchantStats',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('times_shown', models.IntegerField(default=0)),
                ('times_clicked', models.IntegerField(default=0)),
                ('unique_visitors_shown', models.IntegerField(default=0)),
                ('unique_visitors_clicked', models.IntegerField(default=0)),
                ('merchant', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='advertisers.Merchant')),
            ],
        ),
    ]