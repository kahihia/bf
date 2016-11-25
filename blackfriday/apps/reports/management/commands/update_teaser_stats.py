from apps.reports.utils import StatsUpdater
from apps.reports.models import TeaserStats
from apps.catalog.models import Product

from ._private import StatsUpdaterCommand


class Command(StatsUpdaterCommand):
    updater = StatsUpdater(
        stats_cls=TeaserStats,
        related_model_cls=Product,
        related_model_id_name='product_id'
    )
