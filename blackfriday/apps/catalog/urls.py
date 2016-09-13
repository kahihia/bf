from django.conf.urls import url

from .views import CategoryListView, FeedMakerView


urlpatterns = [
    url(r'^categories/$', CategoryListView.as_view(), name='categories-list'),
    url(r'^feed-maker/$', FeedMakerView.as_view(), name='feed-maker'),
]
