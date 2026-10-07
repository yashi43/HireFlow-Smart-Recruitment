from django.db import models
from accounts.models import User
from jobs.models import Job


class Resume(models.Model):

    candidate = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='resume'
    )

    resume_file = models.FileField(upload_to='resumes/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    extracted_text = models.TextField(blank=True)

    def __str__(self):
        return f"{self.candidate.username} Resume"


class ResumeMatch(models.Model):

    resume = models.ForeignKey(
        Resume,
        on_delete=models.CASCADE,
        related_name='matches'
    )

    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name='resume_matches'
    )

    match_percentage = models.FloatField(default=0)

    matched_skills = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.resume.candidate.username} - {self.job.title} - {self.match_percentage}%"