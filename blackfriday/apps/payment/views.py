from django.views.generic import DetailView
from django.http import HttpResponseRedirect

from apps.advertisers.models import ModerationStatus
from apps.orders.models import InvoiceStatus


from .models import Payment


class PaymentFinishedView(DetailView):

    model = Payment
    template_name = 'payment/success.html'
    slug_field = 'invoice_id'
    slug_url_kwarg = 'invoice_id'

    def get(self, request, *args, **kwargs):
        super().get(request, *args, **kwargs)
        if self.object.order_status == '2':
            self.object.invoice.status = InvoiceStatus.paid
            self.object.invoice.save()
            self.object.invoice.merchant.moderation_status = ModerationStatus.new
            self.object.invoice.merchant.save()
        return HttpResponseRedirect(self.object.get_success_url())
