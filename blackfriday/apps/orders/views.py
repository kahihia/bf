from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic.base import TemplateView


class InvoiceListView(LoginRequiredMixin, TemplateView):
    def get_template_names(self):
        if self.request.user.role == 'advertiser':
            return ['orders/advertiser-invoice-list.html']
        return ['orders/invoice-list.html']
