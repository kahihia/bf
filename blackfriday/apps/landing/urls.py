from django.conf.urls import url
from .views import LandingGeneratorView, StaticGeneratorView, LandingPreviewView


urlpatterns = [
    url(r'^landing/$', LandingGeneratorView.as_view(), name='landing'),
    url(r'^landing-preview/', LandingPreviewView.as_view()),
    url(r'^landing-cn-preview/', LandingPreviewView.as_view(template_name='landing/landing-cn.html')),
    url(r'^static-generator/$', StaticGeneratorView.as_view(), name='static-generator'),
]
