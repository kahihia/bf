import pytest

from unittest.mock import patch

from apps.advertisers.tests.factories import MerchantFactory
from apps.reports.models import LogoStats, MerchantStats
from apps.reports.utils import StatsUpdater, MerchantStatsUpdater


pytestmark = pytest.mark.django_db


def test_stats_updater_run():
    merchant = MerchantFactory.create()
    updater = StatsUpdater(
        stats_cls=LogoStats,
        related_model_id_name='merchant_id'
    )
    test_value = 10
    with patch('apps.reports.utils.StatsUpdater.parse_logs', return_value={merchant.id: test_value}):
        updater.run('', '')
        assert LogoStats.objects.get(
            merchant_id=merchant.id,
            times_shown=test_value,
            times_clicked=test_value
        )


def test_merchant_stats_updater_run():
    merchant = MerchantFactory.create()
    updater = MerchantStatsUpdater(
        stats_cls=MerchantStats,
        related_model_id_name='merchant_id'
    )
    test_value = [1, 1, 1, 2, 2]
    with patch('apps.reports.utils.MerchantStatsUpdater.parse_logs', return_value={merchant.id: test_value}):
        updater.run('', '')
        assert MerchantStats.objects.get(
            merchant_id=merchant.id,
            times_shown=len(test_value),
            times_clicked=len(test_value),
            unique_visitors_shown=len(set(test_value)),
            unique_visitors_clicked=len(set(test_value))
        )
