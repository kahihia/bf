from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic.base import TemplateView


class UserListView(LoginRequiredMixin, TemplateView):
    template_name = 'users/users-list.html'
