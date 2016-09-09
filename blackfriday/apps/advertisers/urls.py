from django.conf.urls import url

from .views import AdvertiserListView, MerhcantsListView


urlpatterns = [
    url(r'^advertisers/$', AdvertiserListView.as_view(), name='advertisers-list'),
    url(r'^merchants/$', MerhcantsListView.as_view(), name='merchants-list'),
]
