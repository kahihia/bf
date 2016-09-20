from . import *

PRODUCT_FILE_COLUMNS_MAPPING = {
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


REST_FRAMEWORK = {
    'DEFAULT_FILTER_BACKENDS': (
        'rest_framework.filters.DjangoFilterBackend',
    ),
    'DEFAULT_PAGINATION_CLASS': 'libs.api.pagination.BlackFridayPagination',
}
