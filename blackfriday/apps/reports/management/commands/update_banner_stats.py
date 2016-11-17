import os

from django.core.management.base import BaseCommand, CommandError
from apps.reports.utils import update_stats
from apps.reports.models import BannerStats


class Command(BaseCommand):
    help = "Update banner statistics from log files"

    def add_arguments(self, parser):
        parser.add_argument(
            'shown-log-file',
            help='File name for shown log file',
        )
        parser.add_argument(
            'clicked-log-file',
            help='File name for clicked log file',
        )

    def handle(self, *args, **options):
        print(os.path.exists(options['shown-log-file']), os.path.isfile(options['shown-log-file']))
        # update_stats(BannerStats, 'banner_id')
