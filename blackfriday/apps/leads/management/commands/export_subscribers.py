from django.core.management import BaseCommand

from ...tasks import save_all_subscribers


class Command(BaseCommand):
    def handle(self, *args, **options):
        save_all_subscribers()
