from django.contrib.auth.mixins import UserPassesTestMixin
from apps.users.models import Role


class ManagerOrAdminOnlyMixin(UserPassesTestMixin):
    raise_exception = True

    def test_func(self):
        return self.request.user.role in ('manager', 'admin')


class AdminOnlyMixin(UserPassesTestMixin):
    raise_exception = True

    def test_func(self):
        return self.request.user.role == 'admin'


class ManagerOrAdminOrAdvertiser(UserPassesTestMixin):
    raise_exception = True

    def test_func(self):
        return self.request.user.role in [Role.MANAGER, Role.ADVERTISER, Role.ADMIN]
