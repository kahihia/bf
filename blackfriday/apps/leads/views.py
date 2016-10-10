from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import TemplateView

from apps.users.mixins import RolePermissionMixin


class SubscriberListView(LoginRequiredMixin, RolePermissionMixin, TemplateView):
    allowed_roles = ['admin', 'manager']
    template_name = 'leads/subscriber-list.html'


class AdvertiserRequestListView(LoginRequiredMixin, RolePermissionMixin, TemplateView):
    allowed_roles = ['admin', 'operator']
    template_name = 'leads/advertiser-request-list.html'
