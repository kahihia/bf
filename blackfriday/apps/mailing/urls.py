from django.conf.urls import url

from .views import LogosMailingView, BannersMailingView, GoToMailingView

urlpatterns = [
    url(r'^mailing/$', GoToMailingView.as_view()),
    url(r'^mailing/logos/$', LogosMailingView.as_view(), name='logos'),
    url(r'^mailing/banners/$', BannersMailingView.as_view(), name='banners'),
]
