from django.core.management.base import BaseCommand
from apps.showcase.controllers import actions
from apps.showcase.utils import render_to_file


class Command(BaseCommand):

    def handle(self, *args, **options):
        render_to_file('actions/index.html', actions())
