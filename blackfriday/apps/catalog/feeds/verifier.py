import logging
import requests

from django.conf import settings
from django.db.models import Q
from .validators import (
    IsNumeric, MaxValue, Choices, Substring,
    Length, Required, UtmRequired, Url
)
from apps.catalog.parser import Row, Column, Grouped, GenericValidator
from apps.catalog.utils import xls_dict_reader, yml_dict_reader, csv_dict_reader
from apps.catalog.models import Category


logger = logging.getLogger(__name__)


def to_none(value):
    if value in ['']:
        return None
    return value


def together(**cleaned_data):
    return all(cleaned_data.values()) or not any(cleaned_data.values())


def old_price_gte_price(old_price, price):
    if old_price is None and price is None:
        return None
    if not isinstance(old_price, int) or not isinstance(price, int):
        return None
    return bool(price < old_price)


def duplicate_product_urls(url, context):
    if url is None:
        return None
    if url not in context.get('product_urls'):
        context.get('product_urls').add(url)
        return True
    else:
        return False


def clear_category(category, context):
    if category not in context['categories']:
        return settings.DEFAULT_CATEGORY_NAME
    return category


clear_category.null = True


def clear_currency(currency):
    if currency not in settings.CURRENCY_IDS:
        return 'rur'
    else:
        return currency


clear_currency.null = True


def optional_required(_id, context):
    if context.get('_id_required', True):
        return _id is not None
    return True


def is_image(image):
    if settings.CHECK_IMAGE_URL:
        if image is None:
            return None
        try:
            return requests.head(image, headers=settings.IMAGE_CHECKING_HEADERS).headers['Content-Type'] in [
                'image/jpeg', 'image/png', 'image/pjpeg', 'image/x-png', 'image/jpg', 'image/jpe', 'image/jfif'
            ]
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
                            message='Старая цена должна быть больше новой', rule=old_price_gte_price, is_warning=True)
                    ),
                ),
                Column(
                    'discount', pipes=(float, int),
                    validators=(IsNumeric(), MaxValue(rule=100),)),
                Column(
                    'start_price', pipes=(float, int),
                    validators=(IsNumeric(),)),
            ),
            validators=[GenericValidator(message='Укажите хотя бы одну цену', rule=lambda **data: any(data.values()))]
        ),
        Column(
            'currency', pipes=(clear_currency, str, str.lower,),
            validators=(Required(), Choices(rule=settings.CURRENCY_IDS,),)),
        Column(
            'brand', pipes=(str, str.strip),
            validators=(Required(),)),
        Column(
            'category', pipes=(str, str.lower, clear_category,), validators=(Required(is_warning=True),)),
        Column(
            'country', pipes=(str, str.lower, str.strip, to_none),
            validators=(Required(), Length(rule=255))),
        Column(
            'url', pipes=(str,),
            validators=(
                Required(), Url(), Substring(rule=('http://', 'https://')), UtmRequired(is_warning=True),
                GenericValidator(message='URL повторяется', rule=duplicate_product_urls),)),
        Column(
            'image', pipes=(str, str.strip,),
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
                    str.lower,
                    Category.objects.filter(
                        Q(merchant_id=kwargs.get('merchant_id')) | Q(merchant__isnull=True)
                    ).values_list('name', flat=True)
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
