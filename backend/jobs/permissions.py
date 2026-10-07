from rest_framework.permissions import BasePermission


class IsRecruiter(BasePermission):

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == 'recruiter'
        )

    def has_object_permission(self, request, view, obj):
        return obj.recruiter == request.user