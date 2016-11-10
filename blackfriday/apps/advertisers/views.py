from django.db.models import Prefetch
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import TemplateView, DetailView

from apps.users.mixins import RolePermissionMixin

from .models import Merchant, BannerType, Banner
from apps.catalog.models import Product


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

    queryset = Merchant.objects.prefetch_related(
        'partners',
        Prefetch('products', queryset=Product.objects.all().order_by('id')),
        Prefetch('banners', queryset=Banner.objects.filter(type=BannerType.SUPER), to_attr='superbanners'),
        Prefetch('banners', queryset=Banner.objects.filter(type=BannerType.ACTION), to_attr='actionbanners')
    )

    template_name = 'advertisers/merchant-preview.html'
    context_object_name = 'merchant'

    def test_func(self):
        if self.request.user.role == 'advertiser':
            return self.get_object(self.get_queryset()).owner_id == self.request.user.id
        return super().test_func()

    def get_context_data(self, *args, **kwargs):
        context = super().get_context_data(*args, **kwargs)
        context.update({
            'superbanners': self.object.superbanners,
            'actionbanners': self.object.actionbanners,
            'partners': self.object.partners.all(),
            'is_preview': True
        })
        return context
