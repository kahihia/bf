import xlrd
import xml.etree.ElementTree as ET
import csv
from io import StringIO


COLUMNS_MAPPING = {
    'name': 'name',
    'oldprice': 'old_price',
    'price': 'price',
    'discount': 'discount',
    'startprice': 'start_price',
    'currencyid': 'currency',
    'vendor': 'brand',
    'category': 'category',
    'countryoforigin': 'country',
    'url': 'url',
    'image': 'image',
}


def csv_dict_reader(f):
    data = StringIO(f.read().decode('utf-8'))
    return (
        {
            COLUMNS_MAPPING[key]: value for key, value in row.items() if key in COLUMNS_MAPPING
        } for row in csv.DictReader(data, delimiter=';', quotechar='"')
    )


def xls_dict_reader(f, sheet_index=0):

    book = xlrd.open_workbook(file_contents=f.read())
    sheet = book.sheet_by_index(sheet_index)
    headers = dict(
        (i, sheet.cell_value(0, i)) for i in range(sheet.ncols)
    )

    return (
        dict(
            (COLUMNS_MAPPING[headers[column]], sheet.cell_value(row, column))
            for column in headers if headers[column] in COLUMNS_MAPPING
        ) for row in range(1, sheet.nrows)
    )


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
