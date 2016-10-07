from django.contrib.auth.mixins import UserPassesTestMixin


class RolePermissionMixin(UserPassesTestMixin):
    raise_exception = True

    def test_func(self):
        return self.request.user.role in self.allowed_roles
