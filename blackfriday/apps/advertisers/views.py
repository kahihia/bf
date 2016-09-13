from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.views.generic import TemplateView, DetailView

from apps.users.mixins import ManagerOrAdminOnlyMixin

from .models import Merchant


class AdvertiserListView(LoginRequiredMixin, ManagerOrAdminOnlyMixin, TemplateView):
    template_name = 'advertisers/advertisers-list.html'


class MerchantListView(LoginRequiredMixin, TemplateView):
    template_name = 'advertisers/merchants-list.html'


class MerchantDetailView(LoginRequiredMixin, UserPassesTestMixin, DetailView):
    queryset = Merchant.objects.all()

    template_name = 'advertisers/merchants-details.html'
    context_object_name = 'merchant'

    raise_exception = True

    def test_func(self):
        return (self.request.user.role == 'admin' or
                self.request.user.role == 'advertiser' and
                self.get_object(self.get_queryset()).owner_id == self.request.user.id)


class ModerationListView(LoginRequiredMixin, UserPassesTestMixin, TemplateView):
    template_name = 'advertisers/moderation-list.html'

    raise_exception = True

    def test_func(self):
        return self.request.user.role == 'manager'
