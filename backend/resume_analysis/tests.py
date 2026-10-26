from django.test import TestCase
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from rest_framework import status

from accounts.models import User
from jobs.models import Job
from resume_analysis.models import Resume, ResumeMatch
from resume_analysis.utils import (
    calculate_job_fit,
    calculate_match_percentage,
    clean_skill_token,
)


class ResumeMatchingAlgorithmTests(TestCase):
    def test_clean_skill_token(self):
        self.assertEqual(clean_skill_token(': Python ,'), 'Python')
        self.assertEqual(clean_skill_token('• React.js -'), 'React.js')
        self.assertEqual(clean_skill_token('  Django  '), 'Django')

    def test_calculate_job_fit_full_match(self):
        resume_text = (
            "Senior Python Developer with 5 years experience in Python, "
            "Django, React, and MySQL database architecture. "
            "Built REST APIs and scalable backend services."
        )
        fit = calculate_job_fit(
            resume_text=resume_text,
            job_title="Python Developer",
            skills_required="Python, Django, React, MySQL",
            job_description="Seeking a Python developer experienced in building REST APIs and backend systems.",
        )
        self.assertTrue(fit['valid'])
        self.assertGreaterEqual(fit['match_percentage'], 90.0)
        self.assertEqual(set(fit['matched_skills']), {'Python', 'Django', 'React', 'MySQL'})
        self.assertEqual(fit['missing_skills'], [])

    def test_calculate_job_fit_partial_match(self):
        resume_text = "Frontend engineer specializing in HTML, CSS, JavaScript."
        fit = calculate_job_fit(
            resume_text=resume_text,
            job_title="Full Stack Developer",
            skills_required="JavaScript, Python, Docker, Kubernetes",
            job_description="Develop cloud-native backend services and frontend applications.",
        )
        self.assertTrue(fit['valid'])
        self.assertIn('JavaScript', fit['matched_skills'])
        self.assertIn('Python', fit['missing_skills'])
        self.assertIn('Docker', fit['missing_skills'])
        self.assertIn('Kubernetes', fit['missing_skills'])
        self.assertTrue(0.0 <= fit['match_percentage'] <= 100.0)

    def test_calculate_job_fit_zero_skills_match(self):
        resume_text = "Experienced chef and kitchen manager with culinary expertise."
        fit = calculate_job_fit(
            resume_text=resume_text,
            job_title="Software Architect",
            skills_required="Golang, Rust, Distributed Systems",
            job_description="Design high-throughput distributed microservices.",
        )
        self.assertTrue(fit['valid'])
        self.assertEqual(fit['matched_skills'], [])
        self.assertEqual(set(fit['missing_skills']), {'Golang', 'Rust', 'Distributed Systems'})
        self.assertEqual(fit['skills_score'], 0.0)
        self.assertLess(fit['match_percentage'], 10.0)

    def test_calculate_job_fit_empty_resume(self):
        fit = calculate_job_fit(
            resume_text="",
            job_title="Developer",
            skills_required="Python",
        )
        self.assertFalse(fit['valid'])
        self.assertEqual(fit['match_percentage'], 0.0)


class SmartFitAPITests(TestCase):
    def setUp(self):
        self.candidate = User.objects.create_user(
            username='candidate_fit_test',
            email='fit_test@example.com',
            password='TestPassword123!',
            role=User.Role.CANDIDATE,
        )
        self.other_candidate = User.objects.create_user(
            username='other_candidate_fit',
            email='other_fit@example.com',
            password='TestPassword123!',
            role=User.Role.CANDIDATE,
        )
        self.recruiter = User.objects.create_user(
            username='recruiter_fit_test',
            email='recruiter_fit@example.com',
            password='TestPassword123!',
            role=User.Role.RECRUITER,
        )
        self.job1 = Job.objects.create(
            recruiter=self.recruiter,
            title='Python Full Stack Engineer',
            company='HireFlow Tech',
            location='Remote',
            description='Build web platforms with Python and Django.',
            skills_required='Python, Django, SQL',
        )
        self.job2 = Job.objects.create(
            recruiter=self.recruiter,
            title='Mobile App Developer',
            company='AppCraft Studio',
            location='Bangalore',
            description='Build mobile applications with Flutter and Dart.',
            skills_required='Flutter, Dart, Firebase',
        )
        self.client = APIClient()

    def test_smart_fit_without_resume(self):
        self.client.force_authenticate(user=self.candidate)
        url = reverse('smart-fit-jobs')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertFalse(data['has_resume'])
        self.assertEqual(len(data['jobs']), 0)
        self.assertIn('No resume found', data['message'])

    def test_smart_fit_with_resume(self):
        # Create resume with text
        resume_file = SimpleUploadedFile(
            'test_resume.txt',
            b'Software engineer with skills in Python, Django, SQL and PostgreSQL.',
            content_type='text/plain',
        )
        Resume.objects.create(
            candidate=self.candidate,
            resume_file=resume_file,
            extracted_text='Software engineer with skills in Python, Django, SQL and PostgreSQL.',
        )

        self.client.force_authenticate(user=self.candidate)
        url = reverse('smart-fit-jobs')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()

        self.assertTrue(data['has_resume'])
        self.assertTrue(data['has_text'])
        self.assertEqual(len(data['jobs']), 2)

        # Job1 (Python) should have higher match percentage than Job2 (Flutter)
        job1_data = next(j for j in data['jobs'] if j['id'] == self.job1.id)
        job2_data = next(j for j in data['jobs'] if j['id'] == self.job2.id)

        self.assertGreater(job1_data['match_percentage'], job2_data['match_percentage'])
        self.assertIn('Python', job1_data['matched_skills'])
        self.assertIn('Django', job1_data['matched_skills'])
        self.assertIn('Flutter', job2_data['missing_skills'])

        # Cached record exists in ResumeMatch
        match = ResumeMatch.objects.filter(resume__candidate=self.candidate, job=self.job1).first()
        self.assertIsNotNone(match)
        self.assertEqual(match.match_percentage, job1_data['match_percentage'])

    def test_candidate_isolation_in_smart_fit(self):
        # Other candidate has no resume
        self.client.force_authenticate(user=self.other_candidate)
        url = reverse('smart-fit-jobs')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.json()['has_resume'])

    def test_recruiter_cannot_access_candidate_smart_fit(self):
        self.client.force_authenticate(user=self.recruiter)
        url = reverse('smart-fit-jobs')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
