from django.contrib import admin
from .models import Job


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = (
        'title',
        'company',
        'location',
        'recruiter',
        'experience',
        'created_at',
    )

    search_fields = (
        'title',
        'company',
        'location',
        'skills_required',
    )

    list_filter = (
        'location',
        'experience',
        'created_at',
    )