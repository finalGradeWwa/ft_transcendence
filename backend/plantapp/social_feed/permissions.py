from rest_framework import permissions
from rest_framework.permissions import BasePermission

class IsAuthorOrReadOnly(BasePermission):
    """
    Read : anyone
    Create, Update, Delete : author only
    """

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user == request.user
