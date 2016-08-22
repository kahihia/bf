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


def role_permission(*role_list):
    classes_cache = {}

    if role_list not in classes_cache:
        class RoleBasedPermission(permissions.BasePermission, metaclass=ComplexPermissionMetaClass):
            def has_permission(self, request, view):
                return request.user.role in role_list
        classes_cache[role_list] = RoleBasedPermission
    return classes_cache[role_list]


IsAdmin = role_permission('admin')
