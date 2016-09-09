from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic.base import TemplateView

from apps.users.mixins import ManagerOrAdminOnlyMixin


class AdvertiserListView(LoginRequiredMixin, ManagerOrAdminOnlyMixin, TemplateView):
    template_name = 'advertisers/advertisers-list.html'
