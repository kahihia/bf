from django.views.generic import TemplateView
from apps.users.mixins import RolePermissionMixin
from django.contrib.auth.mixins import LoginRequiredMixin


class ReportsView(LoginRequiredMixin, RolePermissionMixin, TemplateView):
    allowed_roles = ['admin', 'advertiser']
    template_name = 'reports/index.html'
