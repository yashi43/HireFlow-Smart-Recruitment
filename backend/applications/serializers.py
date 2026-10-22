from rest_framework import serializers

from .models import Application


class ApplicationSerializer(serializers.ModelSerializer):
    resume = serializers.FileField(required=True)

    candidate_name = serializers.CharField(
        source="candidate.username",
        read_only=True,
    )

    job_title = serializers.CharField(
        source="job.title",
        read_only=True,
    )

    class Meta:
        model = Application

        fields = [
            "id",
            "candidate",
            "candidate_name",
            "job",
            "job_title",
            "resume",
            "cover_letter",
            "phone",
            "linkedin_url",
            "github_url",
            "status",
            "applied_at",
        ]

        read_only_fields = [
            "id",
            "candidate",
            "candidate_name",
            "job",
            "job_title",
            "status",
            "applied_at",
        ]

    def validate_resume(self, value):
        allowed_extensions = {"pdf", "doc", "docx"}

        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError(
                "Resume size must be 5 MB or less."
            )

        parts = value.name.lower().rsplit(".", 1)

        if len(parts) != 2 or parts[1] not in allowed_extensions:
            raise serializers.ValidationError(
                "Upload a PDF, DOC, or DOCX resume."
            )

        return value

    def validate(self, data):
        request = self.context.get("request")
        job = self.context.get("job") or data.get("job")

        if (
            request
            and request.user.is_authenticated
            and job
            and Application.objects.filter(
                candidate=request.user,
                job=job,
            ).exists()
        ):
            raise serializers.ValidationError(
                "You have already applied for this job."
            )

        return data


class ApplicationStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ["status"]

        
from .models import SavedJob


class SavedJobSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(
        source="job.title",
        read_only=True,
    )

    class Meta:
        model = SavedJob
        fields = ["id", "job", "job_title", "saved_at"]
        read_only_fields = ["id", "saved_at"]

    def validate(self, data):
        request = self.context.get("request")
        job = data.get("job")

        if request and job and SavedJob.objects.filter(
            candidate=request.user,
            job=job,
        ).exists():
            raise serializers.ValidationError(
                {"job": "This job is already saved."}
            )

        return data

