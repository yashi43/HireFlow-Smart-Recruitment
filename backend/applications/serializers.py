from rest_framework import serializers

from .models import Application


class ApplicationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Application

        fields = [
            'id',
            'candidate',
            'job',
            'status',
            'applied_at'
        ]

        read_only_fields = [
            'id',
            'candidate',
            'status',
            'applied_at'
        ]

    def validate(self, data):
        request = self.context.get('request')

        if request and request.user.is_authenticated:
            job = data.get('job')

            if job and Application.objects.filter(
                candidate=request.user,
                job=job
            ).exists():
                raise serializers.ValidationError(
                    'You have already applied for this job.'
                )

        return data


class ApplicationStatusSerializer(serializers.ModelSerializer):

    class Meta:
        model = Application

        fields = [
            'status'
        ]