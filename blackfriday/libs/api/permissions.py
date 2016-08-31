from rest_framework import permissions


class ComplexPermissionMetaClass(type):
    def __or__(cls, other):
        class Permission(BaseComplexPermission):
            def has_permission(self, request, view):
                return (cls().has_permission(request, view) or
                        other().has_permission(request, view))

            def has_object_permission(self, request, view, obj):
                return (cls().has_object_permission(request, view, obj) or
                        other().has_object_permission(request, view, obj))

        return Permission

    def __and__(cls, other):
        class Permission(BaseComplexPermission):
            def has_permission(self, request, view):
                return (cls().has_permission(request, view) and
                        other().has_permission(request, view))

            def has_object_permission(self, request, view, obj):
                return (cls().has_object_permission(request, view, obj) and
                        other().has_object_permission(request, view, obj))
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
    def has_permission(self, request, view):
        return 'pk' in view.kwargs

    def has_object_permission(self, request, view, obj):
        return obj.owner_id == request.user.id


def role_permission(*role_list):
    classes_cache = {}

    if role_list not in classes_cache:
        class RoleBasedPermission(BaseComplexPermission):
            def has_permission(self, request, view):
                return request.user.role in role_list
        classes_cache[role_list] = RoleBasedPermission
    return classes_cache[role_list]


def action_permission(*action_list):
    classes_cache = {}

    if action_list not in classes_cache:
        class ActionBasedPermission(BaseComplexPermission):
            def has_permission(self, request, view):
                return view.action in action_list
        classes_cache[action_list] = ActionBasedPermission
    return classes_cache[action_list]


IsAdmin = role_permission('admin')
IsAdvertiser = role_permission('advertiser')
IsManager = role_permission('manager')
