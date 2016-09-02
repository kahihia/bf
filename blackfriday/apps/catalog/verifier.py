import settings
from .validators import (
    IsNumeric, MaxValue, Choices, Substring,
    Length, Required, UtmRequired
)
from .parser import Row, Column, Grouped, GenericChainedValidator, GenericValidator

from .utils import xls_dict_reader, yml_dict_reader, csv_dict_reader


def together(**cleaned_data):
    return all(cleaned_data.values()) or not any([cleaned_data.values()])


def old_price_gte_price(oldprice, price):
    return price < oldprice


def duplicate_product_urls(value):
    if value not in ProductRow.PRODUCT_URLS:
        ProductRow.PRODUCT_URLS.add(value)
        return True
    else:
        return False


def validate_images(extra_images):
    return all([s in image_url for s in ['http://', 'https://'] for image_url in extra_images])


class ProductRow(Row):
    PRODUCT_URLS = set()
    _columns = (
        Column(
            'name', pipes=(str,),
            validators=(Required(), Length(rule=255))),
        Grouped(
            [
                GenericChainedValidator(message='Оба поля должны быть валидны', rule=together),
                GenericChainedValidator(
                    message='Старая цена больше новой', rule=old_price_gte_price, is_warning=True)
            ],
            Column(
                'oldprice', pipes=(float, int),
                validators=(IsNumeric(blank=True),)),
            Column(
                'price', pipes=(float, int),
                validators=(IsNumeric(blank=True),)),
        ),
        Column(
            'discount', pipes=(float, int),
            validators=(IsNumeric(blank=True), MaxValue(rule=100, blank=True),)),
        Column(
            'startprice', pipes=(float, int),
            validators=(IsNumeric(blank=True),)),
        Column(
            'currencyid', pipes=(str, str.lower),
            validators=(Choices(rule=settings.CURRENCY_IDS, blank=True),)),
        Column(
            'vendor', pipes=(str,),
            validators=(Required(),)),
        Column(
            'category', pipes=(str, str.lower), validators=(Required(is_warning=True),)),
        Column(
            'countryoforigin', pipes=(str, str.lower),
            validators=(Required(), Length(rule=255))),
        Column(
            'url', pipes=(str,),
            validators=(
                Required(), Substring(rule=('http://', 'https://')), UtmRequired(is_warning=True),
                GenericValidator(message='URL повторяется', rule=duplicate_product_urls),)),
        Column(
            'main_image', pipes=(str,),
            validators=(Required(), Substring(rule=('http://', 'https://')))),
    )


class FeedParser:
    def __init__(self, attach, *args, **kwargs):
        self.attach = attach

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

    @classmethod
    def parse_feed(self, row):
        # TODO: clean empty strings with category from xlsx
        return ProductRow(row).validate()
