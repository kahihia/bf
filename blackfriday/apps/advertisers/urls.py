from django.conf.urls import url

from .views import AdvertiserListView


urlpatterns = [
    url(r'^advertisers/$', AdvertiserListView.as_view(), name='list'),
]
