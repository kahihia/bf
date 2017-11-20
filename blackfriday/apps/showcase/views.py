from django.http.response import HttpResponse
from django.http import Http404
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import get_object_or_404
from django.views.generic import View
from django.views.generic.base import TemplateView

from apps.users.mixins import RolePermissionMixin
from apps.catalog.models import Category
from apps.advertisers.models import Merchant

from apps.showcase.controllers import main_page, actions, merchants, category, russiangoods, foreigngoods, partners, merchant


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


class ForeignGoodsPreview(LoginRequiredMixin, RolePermissionMixin, View):
    allowed_roles = ['admin']

    def get(self, request):
        return HttpResponse(content=foreigngoods())


class PartnersPreview(LoginRequiredMixin, RolePermissionMixin, View):
    allowed_roles = ['admin']

    def get(self, request):
        return HttpResponse(content=partners())


class MerchantPreview(LoginRequiredMixin, RolePermissionMixin, View):
    allowed_roles = ['admin', 'advertiser', 'manager']

    def get(self, request, pk):
        try:
            Merchant.objects.filter(invoices__promo__isnull=False, invoices__is_paid=True).distinct().get(pk=pk)
        except Merchant.DoesNotExist:
            raise Http404
        return HttpResponse(content=merchant(pk, is_preview=True))


class RussianCategoryPreview(LoginRequiredMixin, RolePermissionMixin, View):
    allowed_roles = ['admin']

    def get(self, request, pk):
        try:
            Category.objects.russians().get(pk=pk)
        except Category.DoesNotExist:
            raise Http404
        return HttpResponse(content=category(pk, True))


class ForeignCategoryPreview(LoginRequiredMixin, RolePermissionMixin, View):
    allowed_roles = ['admin']

    def get(self, request, pk):
        try:
            Category.objects.foreign().get(pk=pk)
        except Category.DoesNotExist:
            raise Http404
        return HttpResponse(content=category(pk, True))


class RenderingView(LoginRequiredMixin, RolePermissionMixin, TemplateView):
    template_name = 'showcase/rendering.html'
    allowed_roles = ['admin']
