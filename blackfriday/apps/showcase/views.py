from django.http.response import HttpResponse
from django.shortcuts import get_object_or_404
from .utils import main_page, actions, merchants, category

from apps.catalog.models import Category


def main_preview(request):
    return HttpResponse(content=main_page())


def actions_preview(request):
    return HttpResponse(content=actions())


def merchants_preview(request):
    return HttpResponse(content=merchants())


def category_preview(request, pk):
    get_object_or_404(Category, pk=pk)
    return HttpResponse(content=category(pk))
