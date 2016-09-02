from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=120, unique=True, verbose_name='Название')
    slug = models.SlugField(max_length=120, unique=True, verbose_name='Слаг')

    class Meta:
        verbose_name = 'Категория'
        verbose_name_plural = 'Категории'

    def __str__(self):
        return self.name


class Product(models.Model):
    merchant = models.ForeignKey('advertisers.Merchant')
    category = models.ForeignKey(Category, verbose_name='Категория')
    name = models.CharField(max_length=120, unique=True, verbose_name='Название')

    price = models.IntegerField(verbose_name='Цена')
    old_price = models.IntegerField(verbose_name='Старая цена')
    start_price = models.IntegerField(verbose_name='Цена от')
    discount = models.IntegerField(verbose_name='Скидка')
    country = models.CharField(verbose_name='Страна', max_length=255)
    is_teaser = models.BooleanField(verbose_name='Товар является тизером')
    is_teaser_on_main = models.BooleanField(verbose_name='Товар является тизером на главной')
    brand = models.CharField(verbose_name='Брэнд', max_length=255)
    url = models.CharField(verbose_name='Ссылка', max_length=255)
    description = models.TextField(verbose_name='Описание')
    datetime_created = models.DateTimeField(auto_now_add=True, verbose_name='Время создания')

    class Meta:
        verbose_name = 'Товар'
        verbose_name_plural = 'Товары'

    def __str__(self):
        return self.name

    @property
    def extra_images(self):
        return self.images.all()

    @property
    def main_image(self):
        return self.images.filter(is_main=True)


class ProductImage(models.Model):
    product = models.ForeignKey(Product, verbose_name='Товар', related_name='images')
    image = models.FileField(upload_to='products', verbose_name='Изображение')
    is_main = models.BooleanField(default=False)

    class Meta:
        verbose_name = 'Изображение товара'
        verbose_name_plural = 'Изображения товара'
