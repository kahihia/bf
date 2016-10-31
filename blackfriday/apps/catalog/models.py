from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=120, unique=True, verbose_name='Название')
    slug = models.SlugField(max_length=120, unique=True, verbose_name='Слаг')
    merchant = models.ForeignKey('advertisers.Merchant', blank=True, null=True, related_name='categories')

    class Meta:
        verbose_name = 'Категория'
        verbose_name_plural = 'Категории'

    def __str__(self):
        return self.name


class Product(models.Model):
    merchant = models.ForeignKey('advertisers.Merchant', related_name='products')
    category = models.ForeignKey(Category, verbose_name='Категория', related_name='products')
    name = models.CharField(max_length=120, verbose_name='Название')

    price = models.IntegerField(verbose_name='Цена', null=True)
    old_price = models.IntegerField(verbose_name='Старая цена', null=True)
    start_price = models.IntegerField(verbose_name='Цена от', null=True)
    discount = models.IntegerField(verbose_name='Скидка', null=True)
    country = models.CharField(verbose_name='Страна', max_length=255)
    is_teaser = models.BooleanField(verbose_name='Товар является тизером', default=False)
    is_teaser_on_main = models.BooleanField(verbose_name='Товар является тизером на главной', default=False)
    brand = models.CharField(verbose_name='Брэнд', max_length=255)
    url = models.CharField(verbose_name='Ссылка', max_length=255)
    created_datetime = models.DateTimeField(auto_now_add=True, verbose_name='Время создания')
    image = models.URLField()
    currency = models.CharField(max_length=10)

    class Meta:
        verbose_name = 'Товар'
        verbose_name_plural = 'Товары'

    def __str__(self):
        return self.name

    @property
    def owner_id(self):
        return self.merchant.advertiser_id
