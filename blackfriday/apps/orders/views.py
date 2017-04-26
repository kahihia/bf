from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic.base import TemplateView

from apps.users.mixins import RolePermissionMixin


class InvoiceListView(LoginRequiredMixin, RolePermissionMixin, TemplateView):
    allowed_roles = ['manager', 'admin', 'advertiser']

    def test_func(self):
        user_is_special_advertiser = \
            (self.request.user.role == 'advertiser') and \
            (self.request.user.profile.inner or self.request.user.profile.is_supernova)

        return super().test_func() and not user_is_special_advertiser

    def get_template_names(self):
        if self.request.user.role == 'advertiser':
            return ['orders/advertiser-invoice-list.html']
        return ['orders/invoice-list.html']
