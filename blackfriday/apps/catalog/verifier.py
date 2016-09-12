from django.conf import settings
from .validators import (
    IsNumeric, MaxValue, Choices, Substring,
    Length, Required, UtmRequired
)
from .parser import Row, Column, Grouped, GenericValidator
from .utils import xls_dict_reader, yml_dict_reader, csv_dict_reader
from .models import Category


def together(context, **cleaned_data):
    return all(cleaned_data.values()) or not any([cleaned_data.values()])


def old_price_gte_price(old_price, price, context):
    return bool(price and old_price and price < old_price)


def duplicate_product_urls(value, context):
    if value is None:
        return None
    if value not in context.get('product_urls'):
        context.get('product_urls').add(value)
        return True
    else:
        return False


def clear_category(value, context):
    if value is None:
        return None
    if value not in context['categories']:
        return settings.DEFAULT_CATEGORY_NAME
    return value


class ProductRow(Row):
    _columns = (
        Column(
            'name', pipes=(str,),
            validators=(Required(), Length(rule=255))),
        Grouped(
            [
                GenericValidator(message='Оба поля должны быть валидны', rule=together),
                GenericValidator(
                    message='Старая цена больше новой', rule=old_price_gte_price, is_warning=True)
            ],
            Column(
                'old_price', pipes=(float, int),
                validators=(IsNumeric(blank=True),)),
            Column(
                'price', pipes=(float, int),
                validators=(IsNumeric(blank=True),)),
        ),
        Column(
            'discount', pipes=(float, int),
            validators=(IsNumeric(blank=True), MaxValue(rule=100, blank=True),)),
        Column(
            'start_price', pipes=(float, int),
            validators=(IsNumeric(blank=True),)),
        Column(
            'currency', pipes=(str, str.lower),
            validators=(Required(), Choices(rule=settings.CURRENCY_IDS, blank=True),)),
        Column(
            'brand', pipes=(str,),
            validators=(Required(),)),
        Column(
            'category', pipes=(str, str.lower, clear_category), validators=(Required(is_warning=True),)),
        Column(
            'country', pipes=(str, str.lower),
            validators=(Required(), Length(rule=255))),
        Column(
            'url', pipes=(str,),
            validators=(
                Required(), Substring(rule=('http://', 'https://')), UtmRequired(is_warning=True),
                GenericValidator(message='URL повторяется', rule=duplicate_product_urls),)),
        Column(
            'image', pipes=(str,),
            validators=(Required(), Substring(rule=('http://', 'https://')))),
    )


class FeedParser:

    def __init__(self, attach=None, *args, **kwargs):
        self.attach = attach
        self.context = {
            'product_urls': set(),
            'categories': list(map(str.lower, Category.objects.values_list('name', flat=True)))
        }

    def __iter__(self):
        reader = self.get_reader()
        for row in reader:
            yield self.parse_feed(row)

    def get_reader(self):
        if self.is_csv():
            return csv_dict_reader(self.attach.file)
        if self.is_xml():
            return yml_dict_reader(self.attach.file)
        return xls_dict_reader(self.attach.file)

    def is_csv(self):
        return self.attach.name.lower().endswith('.csv')

    def is_xml(self):
        return self.attach.name.lower().endswith('.xml')

    def row_is_blank(self, row):
        return not any(row.values())

    def parse_feed(self, row):
        # TODO: clean empty strings with category from xlsx
        return ProductRow(row, context=self.context).validate()
