import os

from django.core.management.base import BaseCommand, CommandError


class StatsUpdaterCommand(BaseCommand):
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

        created_stats_number, updated_stats_number = self.updater.run(shown_log_file, clicked_log_file)
        self.stdout.write(self.style.SUCCESS(
            '%s: %d created, %d updated' % (
                self.updater.stats_cls.__name__, created_stats_number, updated_stats_number)))
