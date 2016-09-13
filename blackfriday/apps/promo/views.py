from apps.users.mixins import AdminOnlyMixin
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic.base import TemplateView


class PromoMakerView(LoginRequiredMixin, AdminOnlyMixin, TemplateView):
    template_name = 'promo/promo-maker.html'
