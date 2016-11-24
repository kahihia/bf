from apps.reports.utils import StatsUpdater
from apps.reports.models import BannerStats

from ._private import StatsUpdaterCommand


class Command(StatsUpdaterCommand):
    updater = StatsUpdater(
        stats_cls=BannerStats,
        related_model_id_name='banner_id'
    )
