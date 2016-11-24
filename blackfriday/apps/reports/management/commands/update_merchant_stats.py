from apps.reports.utils import MerchantStatsUpdate
from apps.reports.models import MerchantStats

from ._private import StatsUpdaterCommand


class Command(StatsUpdaterCommand):
    updater = MerchantStatsUpdate(
        stats_cls=MerchantStats,
        related_model_id_name='merchant_id'
    )
