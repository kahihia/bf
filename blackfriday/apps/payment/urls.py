from django.conf.urls import url

from .views import PaymentFinishedView


urlpatterns = [
    url(r'^(?P<pk>\d+)/finished/$', PaymentFinishedView.as_view(), name='finished'),
]
