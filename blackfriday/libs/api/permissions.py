from rest_framework import permissions


class ComplexPermissionMetaClass(type):

    def __or__(cls, other):
        class Permission(permissions.BasePermission):
            def has_permission(self, request, view):
                return (cls().has_permission(request, view) or
                        other().has_permission(request, view))

            def has_object_permission(self, request, view, obj):
                return (cls().has_object_permission(request, view, obj) or
                        other().has_object_permission(request, view, obj))

        return Permission

    def __and__(cls, other):
        class Permission(permissions.BasePermission):
            def has_permission(self, request, view):
                return (cls().has_permission(request, view) and
                        other().has_permission(request, view))

            def has_object_permission(self, request, view, obj):
                return (cls().has_object_permission(request, view, obj) and
                        other().has_object_permission(request, view, obj))
        return Permission


class BaseComplexPermission(permissions.BasePermission, metaclass=ComplexPermissionMetaClass):
    pass


class IsOwner(BaseComplexPermission):
    def has_permission(self, request, view):
        return 'pk' in view.kwargs

    def has_object_permission(self, request, view, obj):
        return obj.owner_id == request.user.id


class IsActive(BaseComplexPermission):
    def has_permission(self, request, view):
        return request.user.is_active

    def has_object_permission(self, request, view, obj):
        return request.user.is_active


def role_permission(*role_list):
    classes_cache = {}

    if role_list not in classes_cache:
        class RoleBasedPermission(BaseComplexPermission):
            def has_permission(self, request, view):
                return request.user.role in role_list
        classes_cache[role_list] = RoleBasedPermission
    return classes_cache[role_list]


IsAdmin = role_permission('admin')
IsAdvertiser = role_permission('advertiser')
