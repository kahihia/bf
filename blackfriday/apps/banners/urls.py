from django.conf.urls import url

from .views import PartnerListView


urlpatterns = [
    url(r'^partners/$', PartnerListView.as_view(), name='partner-list'),
]
