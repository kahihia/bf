from django.conf.urls import url

from .views import InvoiceListView


urlpatterns = [
    url(r'^invoices/$', InvoiceListView.as_view(), name='invoice-list'),
]
