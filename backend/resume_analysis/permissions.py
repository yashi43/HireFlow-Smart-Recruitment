from rest_framework.permissions import BasePermission


class IsCandidate(BasePermission):

    message = 'Only candidates can access this feature.'

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == 'candidate'
        )