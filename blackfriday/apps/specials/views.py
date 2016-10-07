from django.contrib.auth.mixins import UserPassesTestMixin, LoginRequiredMixin
from django.views.generic import TemplateView


class SpecialListView(LoginRequiredMixin, UserPassesTestMixin, TemplateView):
    raise_exception = True
    template_name = 'specials/special-list.html'

    def test_func(self):
        return self.request.user.role in ('admin', 'advertiser')
