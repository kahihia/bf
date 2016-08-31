import settings
from .validators import (
    IsNumeric, MaxValue, Choices, Substring,
    Length, Required, UtmRequired
)
from .parser import Row, Column, Related, GenericChainedValidator, GenericValidator

from .utils import xls_dict_reader, yml_dict_reader, csv_dict_reader

PRODUCT_URLS = set()


def together(*columns):
    return all([col.value for col in columns]) or all([not col.value for col in columns])


def old_price_gte_price(*columns):
    old_price = next(col.val for col in columns if col.field == 'oldprice')
    price = next(col.val for col in columns if col.field == 'model')
    return price > old_price


def duplicate_product_urls(value):
    if value not in PRODUCT_URLS:
        PRODUCT_URLS.add(value)
        return True
    else:
        return False


class ProductRow(Row):
    _columns = (
        Column(
            'name', pipes=(str,),
            validators=(Required(), Length(rule=255))),
        Column(
            'description', pipes=('str'),
            validators=(Required(),)),
        Related(
            [
                GenericChainedValidator(message='Оба поля должны быть валидны', rule=together),
                GenericChainedValidator(
                    message='Старая цена больше новой', rule=old_price_gte_price, is_warning=True)],
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
            validators=(Required(), Choices(rule=settings.START_PRICE_CHOICES),)),
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
                Required(), Substring(rule=('http://', 'https://')), GenericValidator(rule=duplicate_product_urls),
                UtmRequired(is_warning=True))),
        Column(
            'main_image', pipes=(str,),
            validators=(Required(), Substring(rule=('http://', 'https://')))),
        # TODO: extra_images

    )


class FeedParser:
    def __init__(self, attach, *args, **kwargs):
        self.attach = attach

    def __iter__(self):
        reader = self.get_reader()
        for row in reader:
            parsed_feed = self.parse_feed(row)
            if parsed_feed:
                yield parsed_feed

    def get_reader(self):
        if self.is_csv():
            return csv_dict_reader(self.attach.file)
        if self.is_xml():
            return yml_dict_reader(self.attach.file)
        return xls_dict_reader(self.attach.file)

    def is_csv(self):
        return self.attach.filename.lower().endswith('.csv')

    def is_xml(self):
        return self.attach.filename.lower().endswith('.xml')

    def row_is_blank(self, row):
        return not any(row.values())

    @classmethod
    def parse_feed(self, row):
        # TODO: clean empty strings with category from xlsx
        return ProductRow(row).verify()
