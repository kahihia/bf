from django.conf.urls import url
from apps.advertisers.views import MerchantDetailView, ModerationListView, MerchantPreview

from .views import AdvertiserListView, MerchantListView, ProfileView


urlpatterns = [
    url(r'^advertisers/$', AdvertiserListView.as_view(), name='advertiser-list'),
    url(r'^merchants/$', MerchantListView.as_view(), name='merchant-list'),
    url(r'^merchants/(?P<pk>\d+)/$', MerchantDetailView.as_view(), name='merchant-details'),
    url(r'^merchants/(?P<pk>\d+)/preview/$', MerchantPreview.as_view(), name='merchant-preview'),
    url(r'^moderation/$', ModerationListView.as_view(), name='moderation-list'),
    url(r'^profile/$', ProfileView.as_view(), name='profile')
]
