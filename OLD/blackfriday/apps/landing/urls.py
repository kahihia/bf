from django.conf.urls import url
from django.views.generic import TemplateView
from .views import LandingGeneratorView, StaticGeneratorView, LandingPreviewView


urlpatterns = [
    url(r'^landing/$', LandingGeneratorView.as_view(), name='landing'),
    url(r'^landing-preview/', LandingPreviewView.as_view()),
    url(r'^landing-cn-preview/', LandingPreviewView.as_view(template_name='landing/landing-cn.html')),
    url(r'^landing-contacts-preview/', TemplateView.as_view(template_name='landing/landing-contacts.html')),
    url(r'^static-generator/$', StaticGeneratorView.as_view(), name='static-generator'),
]
