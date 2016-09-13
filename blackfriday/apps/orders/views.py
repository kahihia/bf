from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic.base import TemplateView


class InvoiceListView(LoginRequiredMixin, TemplateView):
    template_name = 'orders/invoices-list.html'
