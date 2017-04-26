from django.conf.urls import url

from .views import SubscriberListView, AdvertiserRequestListView


urlpatterns = [
    url(r'^subscribers/$', SubscriberListView.as_view(), name='subscriber-list'),
    url(r'^applications/$', AdvertiserRequestListView.as_view(), name='advertiser-request-list'),
]
