import logging
import requests

from django.conf import settings
from .validators import (
    IsNumeric, MaxValue, Choices, Substring,
    Length, Required, UtmRequired
)
from apps.catalog.parser import Row, Column, Grouped, GenericValidator
from apps.catalog.utils import xls_dict_reader, yml_dict_reader, csv_dict_reader
from apps.catalog.models import Category


logger = logging.getLogger(__name__)


def together(**cleaned_data):
    return all(cleaned_data.values()) or not any(cleaned_data.values())


def old_price_gte_price(old_price, price):
    if not old_price and not price:
        return None
    if not isinstance(old_price, int) or not isinstance(price, int):
        return False
    return bool(price and old_price and price < old_price)


def duplicate_product_urls(url, context):
    if url is None:
        return None
    if url not in context.get('product_urls'):
        context.get('product_urls').add(url)
        return True
    else:
        return False


def clear_category(category, context):
    merchant_id = context.get('merchant_id')
    if not category or any(
        map(
            lambda x: x not in context['categories'],
            [(category, merchant_id), (category.lower(), merchant_id)]
        )
    ):
        return settings.DEFAULT_CATEGORY_NAME
    return category


clear_category.null = True


def optional_required(_id, context):
    if context.get('_id_required', True):
        return _id is not None
    return True


def is_image(image):
    if image is None:
        return None
    try:
        return requests.head(image).headers['Content-Type'] in ['image/jpeg', 'image/png']
    except Exception as e:
        logger.error(str(e))
        return False


class ProductRow(Row):
    _columns = (
        Column(
            '_id', pipes=(float, int),
            validators=(IsNumeric(), GenericValidator(message='Обязательное поле', rule=optional_required),)),
        Column(
            'name', pipes=(str,),
            validators=(Required(), Length(rule=255))),
        Grouped(
            columns=(
                Column(
                    'old_price', pipes=(float, int),
                    validators=(IsNumeric(),)),
                Column(
                    'price', pipes=(float, int),
                    validators=(IsNumeric(),)),
            ),
            validators=(
                GenericValidator(message='Оба поля должны быть валидны', rule=together),
                GenericValidator(
                    message='Старая цена больше новой', rule=old_price_gte_price, is_warning=True)
            ),
        ),
        Column(
            'discount', pipes=(float, int),
            validators=(IsNumeric(), MaxValue(rule=100),)),
        Column(
            'start_price', pipes=(float, int),
            validators=(IsNumeric(),)),
        Column(
            'currency', pipes=(str, str.lower),
            validators=(Required(), Choices(rule=settings.CURRENCY_IDS,),)),
        Column(
            'brand', pipes=(str,),
            validators=(Required(),)),
        Column(
            'category', pipes=(clear_category,), validators=(Required(is_warning=True),)),
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
            validators=(
                Required(), Substring(rule=('http://', 'https://')),
                GenericValidator(message='Данный формат не поддерживается', rule=is_image))),
    )


class FeedParser:

    def __init__(self, attach=None, *args, **kwargs):
        self.attach = attach
        self.context = {
            'product_urls': set(),
            'categories': list(
                map(
                    lambda c: (str.lower(c.name), c.merchant_id),
                    Category.objects.all()
                )
            )
        }
        for key, value in kwargs.items():
            self.context[key] = value

    def __iter__(self):
        reader = self.get_reader()
        for counter, row in enumerate(reader):
            row['_id'] = counter
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
