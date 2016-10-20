from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic.base import TemplateView

from .utils import get_landing_context
from apps.users.mixins import RolePermissionMixin


class StaticGeneratorView(LoginRequiredMixin, RolePermissionMixin, TemplateView):
    allowed_roles = ['admin']
    template_name = 'landing/static-generator.html'


class LandingGeneratorView(LoginRequiredMixin, RolePermissionMixin, TemplateView):
    allowed_roles = ['admin']
    template_name = 'landing/landing-generator.html'


class LandingPreviewView(TemplateView):
	template_name = 'landing/landing.html'

	def get_context_data(request):
		return get_landing_context()
