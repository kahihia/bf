from rest_framework import status
from rest_framework.exceptions import APIException


class ServiceUnavailable(APIException):
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE


class BadRequest(APIException):
    status_code = status.HTTP_400_BAD_REQUEST


def exception_handler(exc, context):
    request = context.get('request')
    if request and isinstance(exc, (ValueError, AttributeError)):
        types = {
            type(None): 'Null',
            int: 'Число',
            float: 'Число',
            bool: 'Логическое значение',
            str: 'Строка'
        }

        error_type = types.get(type(request.data))
        if error_type:
            exc = BadRequest('{} не является допустимым значением'.format(error_type))

    from rest_framework.views import exception_handler
    response = exception_handler(exc, context)

    return response
