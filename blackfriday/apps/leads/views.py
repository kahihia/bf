from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.views.generic import TemplateView


class SubscriberListView(LoginRequiredMixin, UserPassesTestMixin, TemplateView):
    template_name = 'leads/subscriber-list.html'

    def test_func(self):
        return self.request.user.role in ('manager', 'admin')


class AdvertiserRequestListView(LoginRequiredMixin, UserPassesTestMixin, TemplateView):
    template_name = 'leads/advertiser-request-list.html'

    def test_func(self):
        return self.request.user.role in ('manager', 'admin')
