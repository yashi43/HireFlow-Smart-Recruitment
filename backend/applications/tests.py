from django.test import TestCase
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import User
from jobs.models import Job
from applications.models import Application, SavedJob


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


class CandidateApplicationWorkflowTests(TestCase):
    def setUp(self):
        self.candidate = User.objects.create_user(
            username='candidate_workflow',
            email='candidate_workflow@example.com',
            password='TestPassword123!',
            role=User.Role.CANDIDATE,
        )
        self.recruiter_owner = User.objects.create_user(
            username='recruiter_owner',
            email='owner@example.com',
            password='TestPassword123!',
            role=User.Role.RECRUITER,
        )
        self.recruiter_unrelated = User.objects.create_user(
            username='recruiter_unrelated',
            email='unrelated@example.com',
            password='TestPassword123!',
            role=User.Role.RECRUITER,
        )
        self.job = Job.objects.create(
            recruiter=self.recruiter_owner,
            title='Full Stack Developer',
            company='HireFlow Technologies',
            location='Bangalore / Remote',
            description='Build full stack web apps with React and Django',
            skills_required='Python, Django, React, MySQL',
            salary='12-15 LPA',
            experience='2+ years',
        )
        self.client = APIClient()

    def test_complete_candidate_application_workflow(self):
        # STEP 1 & 2: Candidate is authenticated and chooses self.job
        self.client.force_authenticate(user=self.candidate)

        # STEP 3: Submit application with resume and details
        fake_resume = SimpleUploadedFile(
            'sample_resume.pdf',
            b'%PDF-1.4 sample resume test content',
            content_type='application/pdf',
        )
        apply_url = reverse('apply-job', kwargs={'job_id': self.job.id})
        data = {
            'resume': fake_resume,
            'phone': '+91 9876543210',
            'cover_letter': 'Very excited to apply for this Full Stack role!',
            'linkedin_url': 'https://linkedin.com/in/testcandidate',
            'github_url': 'https://github.com/testcandidate',
        }

        # STEP 4: Backend accepts and returns 201 Created
        response = self.client.post(apply_url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # STEP 5: Verify record exists in database
        app = Application.objects.filter(candidate=self.candidate, job=self.job).first()
        self.assertIsNotNone(app)
        self.assertEqual(app.status, Application.Status.APPLIED)
        self.assertEqual(app.phone, '+91 9876543210')
        self.assertEqual(app.cover_letter, 'Very excited to apply for this Full Stack role!')

        # Verify duplicate application is rejected
        fake_resume_2 = SimpleUploadedFile('another.pdf', b'%PDF-1.4', content_type='application/pdf')
        dup_response = self.client.post(apply_url, {'resume': fake_resume_2}, format='multipart')
        self.assertEqual(dup_response.status_code, status.HTTP_400_BAD_REQUEST)

        # STEP 6 & 7: Check candidate applications list
        my_apps_url = reverse('my-applications')
        my_apps_res = self.client.get(my_apps_url)
        self.assertEqual(my_apps_res.status_code, status.HTTP_200_OK)
        my_apps_data = my_apps_res.json()
        self.assertEqual(len(my_apps_data), 1)
        self.assertEqual(my_apps_data[0]['id'], app.id)
        self.assertEqual(my_apps_data[0]['job_title'], 'Full Stack Developer')
        self.assertEqual(my_apps_data[0]['status'], 'applied')

        # STEP 8, 9, 10 & 11: Recruiter who owns the job sees the application
        self.client.force_authenticate(user=self.recruiter_owner)
        recruiter_apps_url = reverse('recruiter-applications')
        recruiter_res = self.client.get(recruiter_apps_url)
        self.assertEqual(recruiter_res.status_code, status.HTTP_200_OK)
        recruiter_apps = recruiter_res.json()
        self.assertEqual(len(recruiter_apps), 1)
        self.assertEqual(recruiter_apps[0]['id'], app.id)
        self.assertEqual(recruiter_apps[0]['candidate_name'], 'candidate_workflow')
        self.assertEqual(recruiter_apps[0]['job_title'], 'Full Stack Developer')
        self.assertEqual(recruiter_apps[0]['status'], 'applied')

        # STEP 12: Permissions check:
        # a) Unrelated recruiter sees 0 applications
        self.client.force_authenticate(user=self.recruiter_unrelated)
        unrelated_res = self.client.get(recruiter_apps_url)
        self.assertEqual(unrelated_res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(unrelated_res.json()), 0)

        # b) Candidate cannot view recruiter applications (403 Forbidden)
        self.client.force_authenticate(user=self.candidate)
        forbidden_res = self.client.get(recruiter_apps_url)
        self.assertEqual(forbidden_res.status_code, status.HTTP_403_FORBIDDEN)

        # c) Recruiter cannot submit a job application (403 Forbidden)
        self.client.force_authenticate(user=self.recruiter_owner)
        recruiter_apply_res = self.client.post(apply_url, data, format='multipart')
        self.assertEqual(recruiter_apply_res.status_code, status.HTTP_403_FORBIDDEN)
