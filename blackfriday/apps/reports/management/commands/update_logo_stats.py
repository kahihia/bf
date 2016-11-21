from apps.reports.utils import StatsUpdater
from apps.reports.models import LogoStats

from ._private import StatsUpdaterCommand


class Command(StatsUpdaterCommand):
    updater = StatsUpdater(
        stats_cls=LogoStats,
        related_model_id_name='merchant_id'
    )
