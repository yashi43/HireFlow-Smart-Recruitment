from rest_framework import serializers
from .models import Job


class JobSerializer(serializers.ModelSerializer):

    class Meta:
        model = Job
        fields = [
            'id',
            'recruiter',
            'title',
            'company',
            'location',
            'description',
            'skills_required',
            'salary',
            'experience',
            'created_at'
        ]
        read_only_fields = ['id', 'recruiter', 'created_at']