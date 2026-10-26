from django.shortcuts import get_object_or_404
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser

from .models import Resume, ResumeMatch
from .serializers import ResumeSerializer, ResumeMatchSerializer
from .utils import (
    calculate_match_percentage,
    calculate_job_fit,
    extract_text_from_file,
)
from .permissions import IsCandidate

from jobs.models import Job
from applications.models import Application, SavedJob


def get_or_sync_candidate_resume(user):
    """
    Retrieves the candidate's Resume model instance.
    If none exists in resume_analysis.Resume, checks if the candidate previously
    uploaded a resume via an Application and automatically initializes/syncs it.
    Also ensures extracted_text is populated if the file is readable.
    """
    resume = Resume.objects.filter(candidate=user).first()

    if resume:
        if not resume.extracted_text and resume.resume_file:
            text = extract_text_from_file(resume.resume_file)
            if text:
                resume.extracted_text = text
                resume.save(update_fields=['extracted_text'])
        return resume

    # Check if candidate has an application with a resume file
    app = (
        Application.objects.filter(candidate=user)
        .exclude(resume='')
        .order_by('-applied_at')
        .first()
    )

    if app and app.resume:
        text = extract_text_from_file(app.resume)
        resume = Resume.objects.create(
            candidate=user,
            resume_file=app.resume.name,
            extracted_text=text,
        )
        return resume

    return None


class ResumeUploadView(generics.CreateAPIView):
    serializer_class = ResumeSerializer
    permission_classes = [IsCandidate]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        # Update existing resume if already present, or create a new one
        existing = Resume.objects.filter(candidate=self.request.user).first()
        if existing:
            file_obj = self.request.FILES.get('resume_file')
            if file_obj:
                existing.resume_file = file_obj
                existing.extracted_text = extract_text_from_file(file_obj)
                existing.save()
                # Invalidate cached matches so new scores are computed
                ResumeMatch.objects.filter(resume=existing).delete()
            return existing

        instance = serializer.save(candidate=self.request.user)
        text = extract_text_from_file(instance.resume_file)
        instance.extracted_text = text
        instance.save(update_fields=['extracted_text'])
        return instance


class ResumeUpdateView(generics.UpdateAPIView):
    serializer_class = ResumeSerializer
    permission_classes = [IsCandidate]
    parser_classes = [MultiPartParser, FormParser]
    http_method_names = ['put', 'patch']

    def get_object(self):
        return get_object_or_404(Resume, candidate=self.request.user)

    def perform_update(self, serializer):
        instance = serializer.save()
        if 'resume_file' in self.request.FILES:
            text = extract_text_from_file(instance.resume_file)
            instance.extracted_text = text
            instance.save(update_fields=['extracted_text'])
            ResumeMatch.objects.filter(resume=instance).delete()


class MyResumeView(generics.RetrieveAPIView):
    serializer_class = ResumeSerializer
    permission_classes = [IsCandidate]

    def get_object(self):
        resume = get_or_sync_candidate_resume(self.request.user)
        if not resume:
            return get_object_or_404(Resume, candidate=self.request.user)
        return resume


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
        resume = get_or_sync_candidate_resume(request.user)
        if not resume:
            return Response(
                {'error': 'No resume found. Please upload your resume first.'},
                status=400,
            )

        job = get_object_or_404(Job, id=job_id)

        fit = calculate_job_fit(
            resume.extracted_text,
            job.title,
            job.skills_required,
            job.description,
        )

        if not fit.get('valid'):
            return Response(
                {'error': fit.get('error', 'Could not parse resume text.')},
                status=400,
            )

        match = ResumeMatch.objects.update_or_create(
            resume=resume,
            job=job,
            defaults={
                'match_percentage': fit['match_percentage'],
                'matched_skills': ', '.join(fit['matched_skills']),
            },
        )[0]

        return Response({
            'job': job.title,
            'match_percentage': match.match_percentage,
            'matched_skills': fit['matched_skills'],
            'missing_skills': fit['missing_skills'],
            'skills_score': fit.get('skills_score', 0),
            'title_score': fit.get('title_score', 0),
            'desc_score': fit.get('desc_score', 0),
        })


class SmartFitJobsView(APIView):
    """
    Computes and returns personalized Smart Fit match percentages across all
    available jobs for the authenticated candidate based on their actual resume text.
    """
    permission_classes = [IsCandidate]

    def get(self, request):
        resume = get_or_sync_candidate_resume(request.user)

        if not resume or not resume.resume_file:
            return Response({
                'has_resume': False,
                'has_text': False,
                'message': 'No resume found on file. Upload your resume to calculate your Smart Fit score for each job.',
                'jobs': [],
            })

        if not resume.extracted_text or not resume.extracted_text.strip():
            return Response({
                'has_resume': True,
                'has_text': False,
                'message': 'Your uploaded resume does not contain readable text. Please upload a PDF or DOCX file with selectable text.',
                'jobs': [],
            })

        jobs = Job.objects.all().order_by('-created_at')
        saved_job_ids = set(
            SavedJob.objects.filter(candidate=request.user).values_list('job_id', flat=True)
        )
        applied_job_ids = set(
            Application.objects.filter(candidate=request.user).values_list('job_id', flat=True)
        )

        results = []

        for job in jobs:
            fit = calculate_job_fit(
                resume.extracted_text,
                job.title,
                job.skills_required,
                job.description,
            )

            # Update cache in ResumeMatch
            ResumeMatch.objects.update_or_create(
                resume=resume,
                job=job,
                defaults={
                    'match_percentage': fit['match_percentage'],
                    'matched_skills': ', '.join(fit['matched_skills']),
                },
            )

            results.append({
                'id': job.id,
                'title': job.title,
                'company': job.company,
                'location': job.location,
                'salary': job.salary or 'Not specified',
                'experience': job.experience or 'Experience not specified',
                'description': job.description,
                'skills_required': job.skills_required,
                'match_percentage': fit['match_percentage'],
                'matched_skills': fit['matched_skills'],
                'missing_skills': fit['missing_skills'],
                'is_saved': job.id in saved_job_ids,
                'is_applied': job.id in applied_job_ids,
            })

        # Order by highest match percentage first
        results.sort(key=lambda x: x['match_percentage'], reverse=True)

        return Response({
            'has_resume': True,
            'has_text': True,
            'resume_name': resume.resume_file.name.split('/')[-1],
            'jobs': results,
        })
