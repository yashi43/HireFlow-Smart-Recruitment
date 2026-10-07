from django.contrib import admin

from .models import Analytics


@admin.register(Analytics)
class AnalyticsAdmin(admin.ModelAdmin):

    list_display = (
        'total_users',
        'total_candidates',
        'total_recruiters',
        'total_jobs',
        'total_applications',
        'updated_at',
    )

    list_filter = (
        'updated_at',
    )