from apps.reports.utils import MerchantStatsUpdater
from apps.reports.models import MerchantStats
from apps.advertisers.models import Merchant

from ._private import StatsUpdaterCommand


class Command(StatsUpdaterCommand):
    updater = MerchantStatsUpdater(
        stats_cls=MerchantStats,
        related_model_cls=Merchant,
        related_model_id_name='merchant_id'
    )
