# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2016-08-31 13:32
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('advertisers', '0004_merge_20160831_1300'),
        ('catalog', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Product',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=120, unique=True, verbose_name='Название')),
                ('price', models.IntegerField(verbose_name='Цена')),
                ('old_price', models.IntegerField(verbose_name='Старая цена')),
                ('start_price', models.IntegerField(verbose_name='Цена от')),
                ('discount', models.IntegerField(verbose_name='Скидка')),
                ('country', models.CharField(max_length=255, verbose_name='Страна')),
                ('is_teaser', models.BooleanField(verbose_name='Товар является тизером')),
                ('is_teaser_on_main', models.BooleanField(verbose_name='Товар является тизером на главной')),
                ('brand', models.CharField(max_length=255, verbose_name='Брэнд')),
                ('url', models.CharField(max_length=255, verbose_name='Ссылка')),
                ('description', models.TextField(verbose_name='Описание')),
                ('datetime_created', models.DateTimeField(auto_now_add=True, verbose_name='Время создания')),
                ('category', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='catalog.Category', verbose_name='Категория')),
                ('merchant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='advertisers.Merchant')),
            ],
            options={
                'verbose_name_plural': 'Товары',
                'verbose_name': 'Товар',
            },
        ),
        migrations.CreateModel(
            name='ProductImage',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image', models.FileField(upload_to='products', verbose_name='Изображение')),
                ('is_main', models.BooleanField(default=False)),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='images', to='catalog.Product', verbose_name='Товар')),
            ],
            options={
                'verbose_name_plural': 'Изображения товара',
                'verbose_name': 'Изображение товара',
            },
        ),
    ]
