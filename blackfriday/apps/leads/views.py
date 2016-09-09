from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import TemplateView

from apps.users.mixins import ManagerOrAdminOnlyMixin


class SubscriberListView(LoginRequiredMixin, ManagerOrAdminOnlyMixin, TemplateView):
    template_name = 'leads/subscriber-list.html'


class AdvertiserRequestListView(LoginRequiredMixin, ManagerOrAdminOnlyMixin, TemplateView):
    template_name = 'leads/advertiser-request-list.html'
