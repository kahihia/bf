from django.core.management.base import BaseCommand

from apps.catalog.models import Category

from apps.showcase.controllers import category
from apps.showcase.utils import render_to_file


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument('category_id', type=int)

    def handle(self, category_id, *args, **options):
        try:
            cat = Category.objects.russians().get(id=category_id)
        except Category.DoesNotExist:
            self.stderr.write('Такой категории не существует или в ней нет российских товаров')
        else:
            render_to_file('russian-goods/{}/index.html'.format(cat.slug), category(category_id, True))
