from django.core.management.base import BaseCommand
from apps.showcase.renderers import render_all_merchants


class Command(BaseCommand):

    def handle(self, *args, **options):
        render_all_merchants()
