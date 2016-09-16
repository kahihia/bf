from django.conf.urls import url
from apps.advertisers.views import MerchantDetailView, ModerationListView

from .views import AdvertiserListView, MerchantListView


urlpatterns = [
    url(r'^advertisers/$', AdvertiserListView.as_view(), name='advertiser-list'),
    url(r'^merchants/$', MerchantListView.as_view(), name='merchant-list'),
    url(r'^merchants/(?P<pk>\d+)/$', MerchantDetailView.as_view(), name='merchant-details'),
    url(r'^moderation/$', ModerationListView.as_view(), name='moderation-list'),
]
