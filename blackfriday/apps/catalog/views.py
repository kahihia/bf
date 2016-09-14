from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import TemplateView

from apps.users.mixins import AdminOnlyMixin


class CategoryListView(LoginRequiredMixin, AdminOnlyMixin, TemplateView):
    template_name = 'catalog/category-list.html'


class FeedMakerView(LoginRequiredMixin, AdminOnlyMixin, TemplateView):
    template_name = 'catalog/feed-maker.html'
