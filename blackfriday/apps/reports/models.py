from django.db import models

from apps.advertisers.models import Banner, Merchant
from apps.catalog.models import Product


class BannerStats(models.Model):
    banner = models.OneToOneField(Banner)
    times_shown = models.IntegerField(default=0)
    times_clicked = models.IntegerField(default=0)


class TeaserStats(models.Model):
    product = models.OneToOneField(Product)
    times_shown = models.IntegerField(default=0)
    times_clicked = models.IntegerField(default=0)


class LogoStats(models.Model):
    merchant = models.OneToOneField(Merchant)
    times_shown = models.IntegerField(default=0)
    times_clicked = models.IntegerField(default=0)


class MerchantStats(models.Model):
    merchant = models.OneToOneField(Merchant)
    times_shown = models.IntegerField(default=0)
    times_clicked = models.IntegerField(default=0)
    unique_visitors_shown = models.IntegerField(default=0)
    unique_visitors_clicked = models.IntegerField(default=0)
