from django.conf.urls import url
from .views import LandingGeneratorView, StaticGeneratorView


urlpatterns = [
    url(r'^landing/$', LandingGeneratorView.as_view(), name='landing'),
    url(r'^static-generator/$', StaticGeneratorView.as_view(), name='static-generator'),
]
