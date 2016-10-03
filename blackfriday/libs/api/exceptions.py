from rest_framework import status
from rest_framework.exceptions import APIException


class ServiceUnavailable(APIException):
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE


class BadRequest(APIException):
    status_code = status.HTTP_400_BAD_REQUEST


def exception_handler(exc, context):
    request = context.get('request')
    if request and isinstance(exc, (ValueError, AttributeError)):
        exc = BadRequest('{} не является допустимым значением'.format(request.data))

    from rest_framework.views import exception_handler
    response = exception_handler(exc, context)

    return response
