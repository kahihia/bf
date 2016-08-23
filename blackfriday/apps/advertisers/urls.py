from django.conf.urls import url

from .views import AdvertiserListView


urlpatterns = [
    url(r'^$', AdvertiserListView.as_view(), name='list'),
]
