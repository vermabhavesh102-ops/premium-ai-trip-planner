from rest_framework import permissions


class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if getattr(user, 'role', '') == 'admin' or getattr(user, 'is_staff', False):
            return True
        owner_id = getattr(obj, 'owner_id', None)
        owner_email = getattr(obj, 'owner_email', None)
        if owner_id and str(owner_id) == str(getattr(user, 'id', '')):
            return True
        if owner_email and owner_email == getattr(user, 'email', None):
            return True
        if str(getattr(user, 'id', '')) in (getattr(obj, 'permissions', None) or []):
            return request.method in permissions.SAFE_METHODS
        return False
