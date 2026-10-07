from django.contrib import admin

from .models import Resume, ResumeMatch


@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):

    list_display = (
        'candidate',
        'resume_file',
        'uploaded_at',
    )

    search_fields = (
        'candidate__username',
    )

    list_filter = (
        'uploaded_at',
    )


@admin.register(ResumeMatch)
class ResumeMatchAdmin(admin.ModelAdmin):

    list_display = (
        'resume',
        'job',
        'match_percentage',
        'created_at',
    )

    search_fields = (
        'resume__candidate__username',
        'job__title',
    )

    list_filter = (
        'match_percentage',
        'created_at',
    )