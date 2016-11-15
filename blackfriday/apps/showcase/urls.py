from django.conf.urls import url
from .views import main_preview, actions_preview


urlpatterns = [
    url(r'main/preview/$', main_preview, name='main_preview'),
    url(r'actions/preview/$', actions_preview, name='actions_preview')
]
