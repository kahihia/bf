from django.views.generic.base import TemplateView

from apps.users.mixins import RolePermissionMixin


class MailingView(RolePermissionMixin, TemplateView):
    allowed_roles = ['admin']
    template_name = 'mailing/mailing.html'
