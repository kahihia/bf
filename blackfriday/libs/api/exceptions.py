from rest_framework import status
from rest_framework.exceptions import APIException


class ServiceUnavailable(APIException):
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE


class BadRequest(APIException):
    status_code = status.HTTP_400_BAD_REQUEST


def exception_handler(exc, context):
    error, request = None, context['request']

    if isinstance(exc, (ValueError, AttributeError)):
        error = {
            type(None): 'Null',
            int: 'Число',
            float: 'Число',
            bool: 'Логическое значение',
            str: 'Строка'
        }[type(request.data)]

    if isinstance(exc, OverflowError):
        error = 'Бесконечность'

    if error:
        exc = BadRequest('{} не является допустимым значением'.format(error))

    from rest_framework.views import exception_handler
    response = exception_handler(exc, context)

    return response
