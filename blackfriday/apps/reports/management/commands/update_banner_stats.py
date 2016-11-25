from apps.reports.utils import StatsUpdater
from apps.reports.models import BannerStats
from apps.advertisers.models import Banner

from ._private import StatsUpdaterCommand


class Command(StatsUpdaterCommand):
    updater = StatsUpdater(
        stats_cls=BannerStats,
        related_model_cls=Banner,
        related_model_id_name='banner_id'
    )
