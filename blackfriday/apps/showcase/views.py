from django.http.response import HttpResponse
from django.contrib.auth.mixins import LoginRequiredMixin
from apps.users.mixins import RolePermissionMixin
from django.views.generic import View


from .utils import main_page, actions, merchants, category


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
        return HttpResponse(content=category(pk))
