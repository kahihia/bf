import os

from django.core.management.base import BaseCommand
from django.template.loader import render_to_string
from django.conf import settings


class Command(BaseCommand):

    def handle(self, *args, **options):
        path = os.path.join(settings.PROJECT_ROOT, 'landing')
        os.makedirs(path, exist_ok=True)
        with open(os.path.join(path, 'index.html'), 'w') as f:
            f.seek(0)
            f.write(render_to_string('landing.html'))
            f.truncate()
