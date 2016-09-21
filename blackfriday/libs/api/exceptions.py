from rest_framework import status
from rest_framework.exceptions import APIException


class ServiceUnavailable(APIException):
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE


class BadRequest(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
