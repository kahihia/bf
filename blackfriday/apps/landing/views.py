from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic.base import TemplateView

from apps.users.mixins import RolePermissionMixin


class StaticGeneratorView(LoginRequiredMixin, RolePermissionMixin, TemplateView):
    allowed_roles = ['admin']
    template_name = 'landing/static-generator.html'


class LandingGeneratorView(LoginRequiredMixin, RolePermissionMixin, TemplateView):
    allowed_roles = ['admin']
    template_name = 'landing/landing-generator.html'
