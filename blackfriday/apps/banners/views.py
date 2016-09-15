from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic.base import TemplateView

from apps.users.mixins import AdminOnlyMixin


class PartnerListView(LoginRequiredMixin, AdminOnlyMixin, TemplateView):
    template_name = 'banners/partner-list.html'
