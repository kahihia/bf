from django.core.management.base import BaseCommand
from apps.landing.utils import render_landing


class Command(BaseCommand):

    def handle(self, *args, **options):
        render_landing(raise_exception=False)
