from django.http.response import HttpResponse
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import get_object_or_404
from django.views.generic import View

from apps.users.mixins import RolePermissionMixin
from apps.catalog.models import Category
from apps.advertisers.models import Merchant

from apps.showcase.controllers import main_page, actions, merchants, category, russiangoods, partners, merchant


class MainPreview(LoginRequiredMixin, RolePermissionMixin, View):
    allowed_roles = ['admin']

    def get(self, request):
        return HttpResponse(content=main_page())


class ActionsPreview(LoginRequiredMixin, RolePermissionMixin, View):
    allowed_roles = ['admin']

    def get(self, request):
        return HttpResponse(content=actions())


class MerchantsPreview(LoginRequiredMixin, RolePermissionMixin, View):
    allowed_roles = ['admin']

    def get(self, request):
        return HttpResponse(content=merchants())


class CategoryPreview(LoginRequiredMixin, RolePermissionMixin, View):
    allowed_roles = ['admin']

    def get(self, request, pk):
        get_object_or_404(Category, pk=pk)
        return HttpResponse(content=category(pk))


class RussianGoodsPreview(LoginRequiredMixin, RolePermissionMixin, View):
    allowed_roles = ['admin']

    def get(self, request):
        return HttpResponse(content=russiangoods())


class PartnersPreview(LoginRequiredMixin, RolePermissionMixin, View):
    allowed_roles = ['admin']

    def get(self, request):
        return HttpResponse(content=partners())


class MerchantPreview(LoginRequiredMixin, RolePermissionMixin, View):
    allowed_roles = ['admin']

    def get(self, request, pk):
        get_object_or_404(Merchant, pk=pk)
        return HttpResponse(content=merchant(pk))
