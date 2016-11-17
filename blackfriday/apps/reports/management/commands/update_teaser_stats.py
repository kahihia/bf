from django.core.management.base import BaseCommand
from apps.reports.utils import update_stats
from apps.reports.models import TeaserStats


class Command(BaseCommand):

    def handle(self, *args, **options):
        update_stats(TeaserStats, 'product_id')
