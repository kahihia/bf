from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import TemplateView

from apps.users.mixins import RolePermissionMixin


class SpecialListView(LoginRequiredMixin, RolePermissionMixin, TemplateView):
    allowed_roles = ['admin', 'advertiser']
    template_name = 'specials/special-list.html'
