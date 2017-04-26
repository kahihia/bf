from django.conf import settings
from django.contrib.auth import authenticate, login
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic.base import TemplateView, RedirectView
from django.core.urlresolvers import reverse

from apps.mailing.utils import send_advertiser_registration_mail

from .models import Token, TokenType
from .mixins import RolePermissionMixin
from django.contrib.auth.views import _get_login_redirect_url


from django.contrib.auth import (
    REDIRECT_FIELD_NAME
)
from django.contrib.auth.forms import (
    AuthenticationForm,
)
from django.contrib.sites.shortcuts import get_current_site
from django.http import HttpResponseRedirect
from django.template.response import TemplateResponse
from django.views.decorators.cache import never_cache
from django.views.decorators.debug import sensitive_post_parameters
from django.views.decorators.csrf import csrf_exempt


class UserListView(LoginRequiredMixin, RolePermissionMixin, TemplateView):
    allowed_roles = ['admin']
    template_name = 'users/user-list.html'


class RedirectByRoleMixin:
    def get_redirect_url(self, *args, **kwargs):
        return {
            'admin': reverse('users:user-list'),
            'manager': reverse('advertisers:advertiser-list'),
            'operator': reverse('leads:advertiser-request-list'),
            'advertiser': reverse('advertisers:merchant-list')
        }[self.request.user.role]


class RedirectByRoleView(RedirectByRoleMixin, LoginRequiredMixin, RedirectView):
    pass


class VerificationView(RedirectByRoleMixin, RedirectView):
    permanent = False

    def get_redirect_url(self, *args, **kwargs):
        token = Token.get_token(self.request.GET.get('token'), type=TokenType.VERIFICATION)
        if token and not token.is_expired:
            token.user.activate()
            Token.invalidate(token.user, type=TokenType.VERIFICATION)
            send_advertiser_registration_mail(token.user)
            user = authenticate(user=token.user)
            if user:
                login(self.request, user)
                return super().get_redirect_url(*args, **kwargs)
        return settings.LOGIN_URL


# Standart django login vew cant login without csrf. So we copypasted standart view code
@csrf_exempt
@sensitive_post_parameters()
@never_cache
def login_no_csrf(
        request, template_name='registration/login.html',
        redirect_field_name=REDIRECT_FIELD_NAME,
        authentication_form=AuthenticationForm,
        extra_context=None, redirect_authenticated_user=False):
    """
    Displays the login form and handles the login action.
    """
    redirect_to = request.POST.get(redirect_field_name, request.GET.get(redirect_field_name, ''))

    if redirect_authenticated_user and request.user.is_authenticated:
        redirect_to = _get_login_redirect_url(request, redirect_to)
        if redirect_to == request.path:
            raise ValueError(
                "Redirection loop for authenticated user detected. Check that "
                "your LOGIN_REDIRECT_URL doesn't point to a login page."
            )
        return HttpResponseRedirect(redirect_to)
    elif request.method == "POST":
        form = authentication_form(request, data=request.POST)
        if form.is_valid():
            login(request, form.get_user())
            return HttpResponseRedirect(_get_login_redirect_url(request, redirect_to))
    else:
        form = authentication_form(request)

    current_site = get_current_site(request)

    context = {
        'form': form,
        redirect_field_name: redirect_to,
        'site': current_site,
        'site_name': current_site.name,
    }
    if extra_context is not None:
        context.update(extra_context)

    return TemplateResponse(request, template_name, context)
