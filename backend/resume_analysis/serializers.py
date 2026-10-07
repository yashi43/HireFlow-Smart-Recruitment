from rest_framework import serializers

from .models import Resume, ResumeMatch


class ResumeSerializer(serializers.ModelSerializer):

    class Meta:
        model = Resume

        fields = [
            'id',
            'candidate',
            'resume_file',
            'uploaded_at',
            'extracted_text'
        ]

        read_only_fields = [
            'id',
            'candidate',
            'uploaded_at',
            'extracted_text'
        ]


class ResumeMatchSerializer(serializers.ModelSerializer):

    class Meta:
        model = ResumeMatch

        fields = [
            'id',
            'resume',
            'job',
            'match_percentage',
            'matched_skills',
            'created_at'
        ]

        read_only_fields = [
            'id',
            'resume',
            'match_percentage',
            'matched_skills',
            'created_at'
        ]