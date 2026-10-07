from django.shortcuts import get_object_or_404

from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Resume, ResumeMatch
from .serializers import ResumeSerializer, ResumeMatchSerializer
from .utils import calculate_match_percentage
from .permissions import IsCandidate

from jobs.models import Job


class ResumeUploadView(generics.CreateAPIView):
    serializer_class = ResumeSerializer
    permission_classes = [IsCandidate]

    def perform_create(self, serializer):

        if Resume.objects.filter(
            candidate=self.request.user
        ).exists():

            from rest_framework.exceptions import ValidationError

            raise ValidationError(
                'You already have a resume. Please update it instead.'
            )

        serializer.save(
            candidate=self.request.user
        )


class ResumeUpdateView(generics.UpdateAPIView):
    serializer_class = ResumeSerializer
    permission_classes = [IsCandidate]
    http_method_names = ['put', 'patch']

    def get_object(self):

        return get_object_or_404(
            Resume,
            candidate=self.request.user
        )


class MyResumeView(generics.RetrieveAPIView):
    serializer_class = ResumeSerializer
    permission_classes = [IsCandidate]

    def get_object(self):

        return get_object_or_404(
            Resume,
            candidate=self.request.user
        )


class MyResumeMatchesView(generics.ListAPIView):
    serializer_class = ResumeMatchSerializer
    permission_classes = [IsCandidate]

    def get_queryset(self):

        return ResumeMatch.objects.filter(
            resume__candidate=self.request.user
        ).order_by('-match_percentage')


class CalculateResumeMatchView(APIView):
    permission_classes = [IsCandidate]

    def post(self, request, job_id):

        resume = get_object_or_404(
            Resume,
            candidate=request.user
        )

        job = get_object_or_404(
            Job,
            id=job_id
        )

        percentage, matched_skills = calculate_match_percentage(
            resume.extracted_text,
            job.skills_required
        )

        match = ResumeMatch.objects.update_or_create(
            resume=resume,
            job=job,
            defaults={
                'match_percentage': percentage,
                'matched_skills': ', '.join(matched_skills)
            }
        )[0]

        return Response({
            'job': job.title,
            'match_percentage': match.match_percentage,
            'matched_skills': matched_skills
        })