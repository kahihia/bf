from django.conf.urls import url

from .views import MailingView

urlpatterns = [
    url(r'^mailing/$', MailingView.as_view()),
]
