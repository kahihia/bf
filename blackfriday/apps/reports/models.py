from django.db import models

from apps.advertisers.models import Banner


class BannerStats(models.Model):
    banner = models.OneToOneField(Banner)
    times_shown = models.IntegerField(default=0)
    times_clicked = models.IntegerField(default=0)
