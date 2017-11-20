from django.core.management.base import BaseCommand

from apps.showcase.renderers import render_foreign_category


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument('category_id', type=int)

    def handle(self, category_id, *args, **options):
        render_foreign_category.delay(category_id, True)
