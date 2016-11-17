from django.core.management.base import BaseCommand
from apps.showcase.controllers import russiangoods
from apps.showcase.utils import render_to_file


class Command(BaseCommand):

    def handle(self, *args, **options):
        render_to_file('russian-goods/index.html', russiangoods())
