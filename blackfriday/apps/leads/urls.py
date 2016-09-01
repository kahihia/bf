from django.conf.urls import url

from .views import SubscriberListView


urlpatterns = [
    url(r'^subscribers/$', SubscriberListView.as_view(), name='subscribers-list'),
]
