import xlrd
import xml.etree.ElementTree as ET
from io import StringIO
from csv import DictReader, Error as CSVError
from django.conf import settings

from rest_framework.exceptions import ValidationError


def dict_reader_lowercaser(iterator):
    for row in iterator:
        yield {str.lower(str(key)): value for key, value in row.items()}


def csv_dict_reader(f):
    try:
        return (
            {
                _key: row.get(key) for key, _key in settings.PRODUCT_FILE_COLUMNS_MAPPING.items()
            } for row in dict_reader_lowercaser(
                DictReader(StringIO(f.read().decode('utf-8')), delimiter=';', quotechar='"'))
        )
    except (CSVError, UnicodeDecodeError):
        raise ValidationError('некорректный формат данных')


def xls_dict_reader(f, sheet_index=0):
    try:
        book = xlrd.open_workbook(file_contents=f.read())
        sheet = book.sheet_by_index(sheet_index)
        headers = dict(
            (i, str.lower(sheet.cell_value(0, i))) for i in range(sheet.ncols)
        )
        if set(headers.values()) != set(settings.PRODUCT_FILE_COLUMNS_MAPPING.keys()):
            raise ValidationError('некорректный формат данных')
        return (
            dict(
                (settings.PRODUCT_FILE_COLUMNS_MAPPING[headers[column]], sheet.cell_value(row, column))
                for column in headers
            ) for row in range(1, sheet.nrows)
        )
    except (xlrd.XLRDError, UnicodeDecodeError):
        raise ValidationError('некорректный формат данных')


def yml_dict_reader(f):
    tree = ET.parse(f)
    root = tree.getroot()
    categories = {cat.get('id'): cat.text for cat in root.iter('category')}
    for offer in root.iter('offer'):
        yield {
            'name': offer.findtext('name'),
            'description': offer.findtext('description'),
            'old_price': offer.findtext('oldprice'),
            'price': offer.findtext('price'),
            'discount': None,
            'start_price': None,
            'currency': offer.findtext('currencyId'),
            'brand': offer.findtext('vendor'),
            'category': categories.get(offer.findtext('categoryId'), 'другое'),
            'country': offer.findtext('country_of_origin'),
            'url': offer.findtext('url'),
            'image': offer.findtext('picture'),
        }
