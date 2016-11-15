from django.http.response import HttpResponse
from .utils import main_page, actions


def main_preview(request):
    return HttpResponse(content=main_page())


def actions_preview(request):
    return HttpResponse(content=actions())
