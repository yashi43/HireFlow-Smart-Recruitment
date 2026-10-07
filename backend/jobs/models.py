from django.db import models
from accounts.models import User


class Job(models.Model):

    recruiter = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='jobs'
    )

    title = models.CharField(max_length=150)
    company = models.CharField(max_length=150)
    location = models.CharField(max_length=100)

    description = models.TextField()
    skills_required = models.TextField()

    salary = models.CharField(max_length=100, blank=True)
    experience = models.CharField(max_length=100, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title