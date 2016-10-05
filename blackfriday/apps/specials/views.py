from django.contrib.auth.mixins import UserPassesTestMixin, LoginRequiredMixin
from django.views.generic import TemplateView


class SpecialListView(LoginRequiredMixin, UserPassesTestMixin, TemplateView):
    template_name = 'specials/special-list.html'
