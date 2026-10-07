from rest_framework import serializers

from .models import Analytics


class AnalyticsSerializer(serializers.ModelSerializer):

    class Meta:
        model = Analytics
        fields = [
            'id',
            'total_users',
            'total_candidates',
            'total_recruiters',
            'total_jobs',
            'total_applications',
            'updated_at'
        ]

        read_only_fields = [
            'id',
            'total_users',
            'total_candidates',
            'total_recruiters',
            'total_jobs',
            'total_applications',
            'updated_at'
        ]