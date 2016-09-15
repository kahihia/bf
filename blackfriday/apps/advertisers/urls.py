from django.conf.urls import url
from apps.advertisers.views import MerchantDetailView, ModerationListView

from .views import AdvertiserListView, MerchantListView, ProfileView


urlpatterns = [
    url(r'^advertisers/$', AdvertiserListView.as_view(), name='advertisers-list'),
    url(r'^merchants/$', MerchantListView.as_view(), name='merchants-list'),
    url(r'^merchants/(?P<pk>\d+)/$', MerchantDetailView.as_view(), name='merchant-details'),
    url(r'^moderation/$', ModerationListView.as_view(), name='moderation-list'),
    url(r'^profile/$', ProfileView.as_view(), name='profile')
]
