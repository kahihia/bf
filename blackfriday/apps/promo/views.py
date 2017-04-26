from apps.users.mixins import RolePermissionMixin
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic.base import TemplateView


class PromoMakerView(LoginRequiredMixin, RolePermissionMixin, TemplateView):
    allowed_roles = ['admin']
    template_name = 'promo/promo-maker.html'
