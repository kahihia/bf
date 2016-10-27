from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import TemplateView, DetailView

from apps.users.mixins import RolePermissionMixin

from .models import Merchant


class AdvertiserListView(LoginRequiredMixin, RolePermissionMixin, TemplateView):
    allowed_roles = ['manager', 'admin']
    template_name = 'advertisers/advertiser-list.html'


class MerchantListView(LoginRequiredMixin, RolePermissionMixin, TemplateView):
    allowed_roles = ['manager', 'admin', 'advertiser']
    template_name = 'advertisers/merchant-list.html'


class MerchantDetailView(LoginRequiredMixin, RolePermissionMixin, DetailView):
    allowed_roles = ['admin', 'advertiser']

    queryset = Merchant.objects.all()

    template_name = 'advertisers/merchant-details.html'
    context_object_name = 'merchant'

    def test_func(self):
        if self.request.user.role == 'advertiser':
            return self.get_object(self.get_queryset()).owner_id == self.request.user.id
        return super().test_func()


class ModerationListView(LoginRequiredMixin, RolePermissionMixin, TemplateView):
    allowed_roles = ['admin']
    template_name = 'advertisers/moderation-list.html'


class ProfileView(LoginRequiredMixin, RolePermissionMixin, TemplateView):
    allowed_roles = ['advertiser']
    template_name = 'advertisers/profile.html'


class MerchantPreview(LoginRequiredMixin, RolePermissionMixin, DetailView):
    allowed_roles = ['manager', 'admin', 'advertiser']

    queryset = Merchant.objects.prefetch_related('partners', 'banners', 'products')

    template_name = 'advertisers/merchant-preview.html'
    context_object_name = 'merchant'

    def test_func(self):
        if self.request.user.role == 'advertiser':
            return self.get_object(self.get_queryset()).owner_id == self.request.user.id
        return super().test_func()
