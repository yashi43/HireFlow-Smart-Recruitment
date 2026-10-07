from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.models import User
from jobs.models import Job
from applications.models import Application


class AnalyticsDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role != 'admin':
            return Response(
                {'error': 'Only admin can access analytics.'},
                status=403
            )

        total_users = User.objects.count()

        total_candidates = User.objects.filter(
            role='candidate'
        ).count()

        total_recruiters = User.objects.filter(
            role='recruiter'
        ).count()

        total_jobs = Job.objects.count()

        total_applications = Application.objects.count()

        return Response({
            'total_users': total_users,
            'total_candidates': total_candidates,
            'total_recruiters': total_recruiters,
            'total_jobs': total_jobs,
            'total_applications': total_applications
        })