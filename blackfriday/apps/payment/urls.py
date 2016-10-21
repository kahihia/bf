from django.conf.urls import url

from .views import PaymentFinishedView


urlpatterns = [
    url(r'^payment/(?P<invoice_id>\d+)/finished/$', PaymentFinishedView.as_view(), name='finished'),
]
