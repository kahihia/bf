from django.http.response import HttpResponse
from .utils import main_page, actions, merchants


def main_preview(request):
    return HttpResponse(content=main_page())


def actions_preview(request):
    return HttpResponse(content=actions())


def merchants_preview(request):
    return HttpResponse(content=merchants())
