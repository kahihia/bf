from django.conf.urls import url

from .views import SpecialListView


urlpatterns = [
    url(r'^specials/$', SpecialListView.as_view(), name='special-list'),
]
