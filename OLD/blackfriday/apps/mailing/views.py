from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse
from django.views.generic.base import TemplateView, RedirectView

from apps.users.mixins import RolePermissionMixin


class LogosMailingView(LoginRequiredMixin, RolePermissionMixin, TemplateView):
    allowed_roles = ['admin']
    template_name = 'mailing/mailing-logos.html'


class BannersMailingView(LoginRequiredMixin, RolePermissionMixin, TemplateView):
    allowed_roles = ['admin']
    template_name = 'mailing/mailing-banners.html'


class GoToMailingView(LoginRequiredMixin, RolePermissionMixin, RedirectView):
    allowed_roles = ['admin']

    def get_redirect_url(self):
        return reverse('mailing:logos')


class MailingPreviewView(LoginRequiredMixin, RolePermissionMixin, TemplateView):
    allowed_roles = ['admin']

    def get_template_names(self):
        message_type = self.kwargs.get('message_type')
        return 'mailing/messages/{}_mail.html'.format(message_type)
