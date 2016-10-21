from django.views.generic import DetailView

from libs.api.exceptions import ServiceUnavailable
from apps.orders.models import InvoiceStatus


from .models import Payment


class PaymentFinishedView(DetailView):

    model = Payment
    template_name = 'payment/success.html'
    slug_field = 'invoice_id'
    slug_url_kwarg = 'invoice_id'

    def get(self, request, *args, **kwargs):
        response = super().get(request, *args, **kwargs)
        if self.object.is_successfull:
            self.object.invoice.status = InvoiceStatus.paid
            self.object.invoice.save()
        return response

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        try:
            context.update(
                {
                    'status': self.object.status,
                    'message': self.object.message
                }
            )
        except ServiceUnavailable:
            context.update(
                {
                    'status': 'Неизвестен',
                    'message': 'Сервис временно недоступен'
                }
            )
        return context
