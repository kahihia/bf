from django.core.management.base import BaseCommand
from apps.showcase.renderers import render_partners


class Command(BaseCommand):

    def handle(self, *args, **options):
        render_partners.delay(True)
