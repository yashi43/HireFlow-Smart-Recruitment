from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import User
from jobs.models import Job
from applications.models import SavedJob


class SavedJobDeleteTests(TestCase):
    def setUp(self):
        self.candidate = User.objects.create_user(
            username='testcandidate_unit',
            email='testunit@example.com',
            password='TestPassword123!',
            role=User.Role.CANDIDATE,
        )
        self.other_candidate = User.objects.create_user(
            username='othercandidate_unit',
            email='otherunit@example.com',
            password='TestPassword123!',
            role=User.Role.CANDIDATE,
        )
        self.recruiter = User.objects.create_user(
            username='testrecruiter_unit',
            email='recruiterunit@example.com',
            password='TestPassword123!',
            role=User.Role.RECRUITER,
        )
        self.job = Job.objects.create(
            recruiter=self.recruiter,
            title='Software Engineer',
            company='TechCorp',
            location='Remote',
            description='Test description',
            skills_required='Python, React',
        )
        self.saved_job = SavedJob.objects.create(
            candidate=self.candidate,
            job=self.job,
        )
        self.client = APIClient()

    def test_delete_saved_job_success(self):
        self.client.force_authenticate(user=self.candidate)
        url = reverse('delete-saved-job', kwargs={'job_id': self.job.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(SavedJob.objects.filter(id=self.saved_job.id).exists())
        self.assertTrue(Job.objects.filter(id=self.job.id).exists())

    def test_cannot_delete_other_user_saved_job(self):
        self.client.force_authenticate(user=self.other_candidate)
        url = reverse('delete-saved-job', kwargs={'job_id': self.job.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(SavedJob.objects.filter(id=self.saved_job.id).exists())
