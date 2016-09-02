import xlrd
import mmap
import xml.etree.ElementTree as ET
import csv
from io import StringIO


def csv_dict_reader(f):
    data = StringIO(f.read().decode('utf-8'))
    return csv.DictReader(data, delimiter=';', quotechar='"')


def xls_dict_reader(f, sheet_index=0):

    book = xlrd.open_workbook(file_contents=f.read())
    sheet = book.sheet_by_index(sheet_index)
    headers = dict(
        (i, sheet.cell_value(0, i)) for i in range(sheet.ncols)
    )

    return (
        dict(
            (headers[column], sheet.cell_value(row, column))
            for column in headers
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
            'oldprice': offer.findtext('oldprice'),
            'price': offer.findtext('price'),
            'discount': None,
            'startprice': 'Нет',
            'currencyid': offer.findtext('currencyId'),
            'vendor': offer.findtext('vendor'),
            'category': categories.get(offer.findtext('categoryId'), 'другое'),
            'countryoforigin': offer.findtext('country_of_origin'),
            'url': offer.findtext('url'),
            'image1': offer.findtext('picture'),
            'image2': None,
            'image3': None,
        }
