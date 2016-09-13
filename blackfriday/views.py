from apps.users.mixins import AdminOnlyMixin
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic.base import TemplateView


class StaticGeneratorView(LoginRequiredMixin, AdminOnlyMixin, TemplateView):
    template_name = 'static-generator.html'


class LandingGeneratorView(LoginRequiredMixin, AdminOnlyMixin, TemplateView):
    template_name = 'landing-generator.html'
