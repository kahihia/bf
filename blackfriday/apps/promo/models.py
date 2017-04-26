from apps.catalog.models import Category
from django.contrib.staticfiles import finders
from django.conf import settings
from django.db import models
from django.db.models import Sum
from django.templatetags.static import static
from django.utils import timezone


class Promo(models.Model):
    name = models.CharField(max_length=120, unique=True, verbose_name='Наименование')
    price = models.IntegerField(verbose_name='Цена')
    is_custom = models.BooleanField(default=True, verbose_name='Кастомный пакет')

    available_options = models.ManyToManyField('promo.Option', related_name='available_in_promos',
                                               verbose_name='Доступные опции')

    class Meta:
        verbose_name = 'Рекламный пакет'
        verbose_name_plural = 'Рекламные пакеты'

    def __str__(self):
        return self.name


class Option(models.Model):
    name = models.CharField(max_length=120, unique=True, verbose_name='Название')
    tech_name = models.SlugField(unique=True, verbose_name='Техническое название')

    price = models.IntegerField(verbose_name='Цена')
    max_count = models.IntegerField(null=True, blank=True, verbose_name='Максимальное количество')

    is_required = models.BooleanField(default=False, verbose_name='Обязательна для пакета')
    is_boolean = models.BooleanField(default=False, verbose_name='Логическая')

    @property
    def count_available(self):
        if self.max_count:
            qs = self.in_invoices.exclude(invoice__is_paid=False, invoice__expired_datetime__lte=timezone.now())
            ordered = qs.aggregate(result=Sum('value')).get('result') or 0
            return self.max_count - ordered

    @property
    def is_available(self):
        if self.max_count:
            return self.count_available > 0
        return True

    @property
    def image(self):
        path_to_image = 'images/options/{}.jpg'.format(self.tech_name)
        if finders.find(path_to_image):
            return settings.SITE_URL + static(path_to_image)
        else:
            return None

    @classmethod
    def calculate_restrictions(cls):
        cls.objects.filter(tech_name='cat_background').update(max_count=Category.objects.all().count())

    class Meta:
        verbose_name = 'Тарифная опция'
        verbose_name_plural = 'Тарифные опции'

    def __str__(self):
        return self.name


class PromoOption(models.Model):
    promo = models.ForeignKey(Promo, related_name='options')
    option = models.ForeignKey(Option, related_name='promos')
    value = models.IntegerField(default=0, verbose_name='Значение')

    class Meta:
        verbose_name = 'Подключенная тарифная опция'
        verbose_name_plural = 'Подключенные тарифные опции'
        unique_together = [('promo', 'option')]

    def __str__(self):
        return ': '.join([self.promo.name, self.option.name])
