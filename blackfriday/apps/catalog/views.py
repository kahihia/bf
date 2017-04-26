from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import TemplateView

from apps.users.mixins import RolePermissionMixin


class CategoryListView(LoginRequiredMixin, RolePermissionMixin, TemplateView):
    allowed_roles = ['admin']
    template_name = 'catalog/category-list.html'


class FeedMakerView(LoginRequiredMixin, RolePermissionMixin, TemplateView):
    allowed_roles = ['admin']
    template_name = 'catalog/feed-maker.html'
