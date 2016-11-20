from django.core.management.base import BaseCommand

from apps.showcase.renderers import render_merchant


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument('merchant_id', type=int)

    def handle(self, merchant_id, *args, **options):
        render_merchant(merchant_id, True)
