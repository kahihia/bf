from django.db import models

from apps.advertisers.models import Banner, Merchant
from apps.catalog.models import Product


class BannerStats(models.Model):
    banner = models.OneToOneField(Banner)
    times_shown = models.IntegerField(default=0)
    times_clicked = models.IntegerField(default=0)

    def __str__(self):
        return "banner_id={}, shown={}, clicked={}".format(
            self.banner_id, self.times_shown, self.times_clicked)


class TeaserStats(models.Model):
    product = models.OneToOneField(Product)
    times_shown = models.IntegerField(default=0)
    times_clicked = models.IntegerField(default=0)

    def __str__(self):
        return "product_id={}, shown={}, clicked={}".format(
            self.product_id, self.times_shown, self.times_clicked)


class LogoStats(models.Model):
    merchant = models.OneToOneField(Merchant)
    times_shown = models.IntegerField(default=0)
    times_clicked = models.IntegerField(default=0)

    def __str__(self):
        return "merchant_id={}, shown={}, clicked={}".format(
            self.merchant_id, self.times_shown, self.times_clicked)


class MerchantStats(models.Model):
    merchant = models.OneToOneField(Merchant)
    times_shown = models.IntegerField(default=0)
    times_clicked = models.IntegerField(default=0)
    unique_visitors_shown = models.IntegerField(default=0)
    unique_visitors_clicked = models.IntegerField(default=0)

    def __str__(self):
        return "merchant_id={}, shown={}, clicked={}, unique_shows={}, unique_clicks={}".format(
            self.merchant_id, self.times_shown, self.times_clicked, self.unique_visitors_shown,
            self.unique_visitors_clicked)
