from collections import OrderedDict
from django.core.paginator import EmptyPage

from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class BlackFridayPagination(PageNumberPagination):
    page_size_query_param = 'paginate_by'

    def get_paginated_response(self, data):

        return Response(OrderedDict([
            ('count', self.page.paginator.count),
            ('current_page', self.page.number),
            ('next_page', self.get_next_page()),
            ('previous_page', self.get_previous_page()),
            ('last_page', self.page.paginator.num_pages),
            ('results', data)
        ]))

    def get_next_page(self):
        try:
            return self.page.next_page_number()
        except EmptyPage:
            return None

    def get_previous_page(self):
        try:
            return self.page.previous_page_number()
        except EmptyPage:
            return None
