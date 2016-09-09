from django.contrib.auth.mixins import UserPassesTestMixin


class ManagerOrAdminOnlyMixin(UserPassesTestMixin):
    raise_exception = True

    def test_func(self):
        return self.request.user.role in ('manager', 'admin')


class AdminOnlyMixin(UserPassesTestMixin):
    raise_exception = True

    def test_func(self):
        return self.request.user.role == 'admin'
