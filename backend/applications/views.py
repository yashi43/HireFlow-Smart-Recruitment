import django.shortcuts

from rest_framework import generics
from rest_framework.exceptions import ValidationError
from rest_framework.parsers import MultiPartParser, FormParser

from .models import Application
from .serializers import (
    ApplicationSerializer,
    ApplicationStatusSerializer,
)
from .permissions import IsCandidate, IsRecruiter
from jobs.models import Job


class ApplyJobView(generics.CreateAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsCandidate]
    parser_classes = [MultiPartParser, FormParser]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["job"] = django.shortcuts.get_object_or_404(
            Job,
            id=self.kwargs["job_id"],
        )
        return context

    def perform_create(self, serializer):
        job = django.shortcuts.get_object_or_404(
            Job,
            id=self.kwargs["job_id"],
        )

        already_applied = Application.objects.filter(
            candidate=self.request.user,
            job=job,
        ).exists()

        if already_applied:
            raise ValidationError(
                "You have already applied for this job."
            )

        serializer.save(
            candidate=self.request.user,
            job=job,
        )


class MyApplicationsView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsCandidate]

    def get_queryset(self):
        return Application.objects.filter(
            candidate=self.request.user,
        ).order_by("-applied_at")


class RecruiterApplicationsView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsRecruiter]

    def get_queryset(self):
        return Application.objects.filter(
            job__recruiter=self.request.user,
        ).order_by("-applied_at")


class UpdateApplicationStatusView(generics.UpdateAPIView):
    serializer_class = ApplicationStatusSerializer
    permission_classes = [IsRecruiter]
    http_method_names = ["patch"]

    def get_queryset(self):
        return Application.objects.filter(
            job__recruiter=self.request.user,
        )
