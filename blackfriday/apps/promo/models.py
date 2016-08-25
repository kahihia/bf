from django.db import models


class Promo(models.Model):
    name = models.CharField(max_length=120, unique=True, verbose_name='Наименование')
    price = models.IntegerField(verbose_name='Цена')
    is_custom = models.BooleanField(default=True, verbose_name='Кастомный пакет')

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

    image = models.ImageField(upload_to='promo', verbose_name='Изображение')

    @property
    def is_available(self):
        # TODO: Implement it after `apps.invoices` realization
        return True

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
