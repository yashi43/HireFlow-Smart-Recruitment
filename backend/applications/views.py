from django.shortcuts import get_object_or_404

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Application
from .serializers import (
    ApplicationSerializer,
    ApplicationStatusSerializer
)
from .permissions import IsCandidate, IsRecruiter
from jobs.models import Job


class ApplyJobView(generics.CreateAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsCandidate]

    def perform_create(self, serializer):

        job = get_object_or_404(
            Job,
            id=self.kwargs['job_id']
        )

        if Application.objects.filter(
            candidate=self.request.user,
            job=job
        ).exists():

            from rest_framework.exceptions import ValidationError

            raise ValidationError(
                'You have already applied for this job.'
            )

        serializer.save(
            candidate=self.request.user,
            job=job
        )

class RecruiterApplicationsView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsRecruiter]

    def get_queryset(self):
        return Application.objects.filter(
            job__recruiter=self.request.user
        ).order_by('-applied_at')


class UpdateApplicationStatusView(generics.UpdateAPIView):
    serializer_class = ApplicationStatusSerializer
    permission_classes = [IsRecruiter]
    http_method_names = ['patch']

    def get_queryset(self):
        return Application.objects.filter(
            job__recruiter=self.request.user
        )