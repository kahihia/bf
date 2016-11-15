from django.conf.urls import url
from .views import main_preview, actions_preview, merchants_preview, category_preview


urlpatterns = [
    url(r'main/preview/$', main_preview, name='main_preview'),
    url(r'actions/preview/$', actions_preview, name='actions_preview'),
    url(r'merchants/preview/$', merchants_preview, name='merchants_preview'),
    url(r'categories/(?P<pk>\d+)/preview/$', category_preview, name='category_preview'),
]
