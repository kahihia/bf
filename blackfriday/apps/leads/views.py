from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.views.generic import TemplateView

from apps.users.mixins import ManagerOrAdminOnlyMixin


class SubscriberListView(LoginRequiredMixin, ManagerOrAdminOnlyMixin, TemplateView):
    template_name = 'leads/subscriber-list.html'


class AdvertiserRequestListView(LoginRequiredMixin, UserPassesTestMixin, TemplateView):
    raise_exception = True

    def test_func(self):
        return self.request.user.role in ('operator', 'admin')

    template_name = 'leads/advertiser-request-list.html'
