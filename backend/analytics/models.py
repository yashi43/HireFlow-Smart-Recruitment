from django.db import models


class Analytics(models.Model):

    total_users = models.PositiveIntegerField(default=0)
    total_candidates = models.PositiveIntegerField(default=0)
    total_recruiters = models.PositiveIntegerField(default=0)
    total_jobs = models.PositiveIntegerField(default=0)
    total_applications = models.PositiveIntegerField(default=0)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Analytics - {self.updated_at}"
