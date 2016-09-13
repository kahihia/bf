from django.conf import settings
from django.contrib.auth import authenticate, login
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic.base import TemplateView, RedirectView
from django.core.urlresolvers import reverse

from .models import Token, TokenType
from .mixins import AdminOnlyMixin


class UserListView(LoginRequiredMixin, AdminOnlyMixin, TemplateView):
    template_name = 'users/users-list.html'


class RedirectByRoleView(LoginRequiredMixin, RedirectView):

    def get_redirect_url(self, *args, **kwargs):
        return {
            'admin': reverse('users:list'),
            'manager': reverse('advertisers:advertisers-list'),
            'advertiser': reverse('advertisers:merchants-list')
        }[self.request.user.role]


class VerificationView(RedirectView):
    permanent = False

    def get_redirect_url(self, *args, **kwargs):
        token = Token.get_token(self.request.GET.get('token'), type=TokenType.VERIFICATION)
        if token and not token.is_expired:
            token.user.activate()
            Token.invalidate(token.user, type=TokenType.VERIFICATION)
            user = authenticate(user=token.user)
            if user:
                login(self.request, user)
                if user.role == 'admin':
                    return '/admin/users/'
                if user.role == 'advertiser':
                    return '/admin/merchants/'
                return '/admin/advertisers/'
        return settings.LOGIN_URL
