from django.conf.urls import url
from django.views.generic.base import TemplateView
from django.contrib.auth import views as auth_views

from .views import UserListView, VerificationView, RedirectByRoleView


urlpatterns = [
    url(r'^$', RedirectByRoleView.as_view()),
    url(r'^registration/$', TemplateView.as_view(template_name='users/registration.html')),
    url(r'^login/$', auth_views.login, {'template_name': 'users/login.html', 'redirect_authenticated_user': True}),
    url(r'^verification/$', VerificationView.as_view(), name='verification'),

    url(r'^users/$', UserListView.as_view(), name='list'),
]
