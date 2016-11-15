from django.conf.urls import url
from .views import main_preview


urlpatterns = [
    url(r'main/preview/$', main_preview, name='main_preview')
]
