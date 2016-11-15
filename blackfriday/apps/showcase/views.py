from django.http.response import HttpResponse
from .utils import main_page


def main_preview(request):
    return HttpResponse(content=main_page())
