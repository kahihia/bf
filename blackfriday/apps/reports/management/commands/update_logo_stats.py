import os

from django.core.management.base import BaseCommand, CommandError
from apps.reports.utils import StatsUpdater
from apps.reports.models import LogoStats


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
        shown_log_file = options['shown-log-file']
        clicked_log_file = options['clicked-log-file']
        error_msg = 'File %s does not exist'
        if not os.path.isfile(shown_log_file):
            raise CommandError(error_msg % shown_log_file)
        if not os.path.isfile(clicked_log_file):
            raise CommandError(error_msg % clicked_log_file)

        updater = StatsUpdater(
            stats_cls=LogoStats,
            related_model_id_name='merchant_id',
            clicked_file=clicked_log_file,
            shown_file=shown_log_file
        )
        created_stats_number, updated_stats_number = updater.run()
        self.stdout.write(self.style.SUCCESS(
            'Logo statistics: %d created, %d updated' % (created_stats_number, updated_stats_number)))
