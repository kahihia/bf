REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': (
        'djangorestframework_camel_case.render.CamelCaseJSONRenderer',
    ),
    'DEFAULT_PARSER_CLASSES': (
        'djangorestframework_camel_case.parser.CamelCaseJSONParser',
        'libs.api.parsers.CamelCaseFormParser',
        'libs.api.parsers.CamelCaseMultiPartParser',
    ),
    'DEFAULT_FILTER_BACKENDS': (
        'rest_framework.filters.DjangoFilterBackend',
    ),
    'DEFAULT_PAGINATION_CLASS': 'libs.api.pagination.BlackFridayPagination',
    'EXCEPTION_HANDLER': 'libs.api.exceptions.exception_handler'
}
