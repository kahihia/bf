from django.core.management.base import BaseCommand
from apps.reports.utils import update_stats
from apps.reports.models import LogoStats


class Command(BaseCommand):

    def handle(self, *args, **options):
        update_stats(LogoStats, 'merchant_id')
