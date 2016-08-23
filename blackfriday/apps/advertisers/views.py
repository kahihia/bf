from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic.base import TemplateView


class AdvertiserListView(LoginRequiredMixin, TemplateView):
    template_name = 'advertisers/advertisers-list.html'
