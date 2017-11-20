from django.core.management.base import BaseCommand
from apps.showcase.renderers import render_foreigngoods


class Command(BaseCommand):

    def handle(self, *args, **options):
        render_foreigngoods.delay(True)
