import logging

from django.conf import settings
from django.db import connection
from django.utils.deprecation import MiddlewareMixin


class SQLLogMiddleware(MiddlewareMixin):

    def process_response(self, request, response):
        if settings.DEBUG:
            logger = logging.getLogger('sql_queries')
            for query in connection.queries:
                sql, time = query.get('sql'), query.get('time')
                logger.debug(''.join(['[', time, '] ', sql]))
        return response
