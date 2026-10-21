from django.db import models
from django.core.validators import FileExtensionValidator

from accounts.models import User
from jobs.models import Job


class Application(models.Model):

    class Status(models.TextChoices):
        APPLIED = 'applied', 'Applied'
        SHORTLISTED = 'shortlisted', 'Shortlisted'
        REJECTED = 'rejected', 'Rejected'
        HIRED = 'hired', 'Hired'

    candidate = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='applications'
    )

    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name='applications'
    )

    resume = models.FileField(
        upload_to='application_resumes/',
        validators=[
            FileExtensionValidator(
                allowed_extensions=['pdf', 'doc', 'docx']
            )
        ],
        blank=True
    )

    cover_letter = models.TextField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    linkedin_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.APPLIED
    )

    applied_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['candidate', 'job'],
                name='unique_candidate_job_application'
            )
        ]

    def __str__(self):
        return f"{self.candidate.username} - {self.job.title}"
