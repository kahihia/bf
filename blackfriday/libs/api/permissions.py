from rest_framework import permissions


class ComplexPermissionMetaClass(type):
    def __or__(cls, other):
        class Permission(BaseComplexPermission):
            def has_permission(self, request, view):
                a = cls().has_permission(request, view)
                b = other().has_permission(request, view)
                # print(cls.__name__, "OR", other.__name__, a, b)
                return (a or
                        b)

            def has_object_permission(self, request, view, obj):
                a = cls().has_object_permission(request, view, obj)
                b = other().has_object_permission(request, view, obj)
                print(cls.__name__, "OR", other.__name__, a, b)

                return (a or
                        b)

        return Permission

    def __and__(cls, other):
        class Permission(BaseComplexPermission):
            def has_permission(self, request, view):
                a = cls().has_permission(request, view)
                b = other().has_permission(request, view)
                # print(cls.__name__, "AND", other.__name__, a, b)
                return (a and
                        b)

            def has_object_permission(self, request, view, obj):
                a = cls().has_object_permission(request, view, obj)
                b = other().has_object_permission(request, view, obj)
                print(cls.__name__, "AND", other.__name__, a, b)
                return (a and
                        b)
        return Permission


class BaseComplexPermission(permissions.BasePermission, metaclass=ComplexPermissionMetaClass):
    pass


class ReadOnly(BaseComplexPermission):
    def has_permission(self, request, view):
        return request.method in permissions.SAFE_METHODS


class IsAuthenticated(BaseComplexPermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_active


class IsOwner(BaseComplexPermission):
    def has_object_permission(self, request, view, obj):
        return obj.owner_id == request.user.id


def role_permission(*role_list):
    classes_cache = {}

    if role_list not in classes_cache:
        class RoleBasedPermission(BaseComplexPermission):
            def has_permission(self, request, view):
                return request.user.role in role_list

            def has_object_permission(self, request, view, obj):
                return request.user.role in role_list

        classes_cache[role_list] = RoleBasedPermission
    return classes_cache[role_list]


def action_permission(*action_list):
    classes_cache = {}

    if action_list not in classes_cache:
        class ActionBasedPermission(BaseComplexPermission):
            def has_permission(self, request, view):
                return view.action in action_list

            def has_object_permission(self, request, view, obj):
                return view.action in action_list

        classes_cache[action_list] = ActionBasedPermission
    return classes_cache[action_list]


IsAdmin = role_permission('admin')
IsAdvertiser = role_permission('advertiser')
IsManager = role_permission('manager')
