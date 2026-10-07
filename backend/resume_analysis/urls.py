from django.urls import path

from .views import (
    ResumeUploadView,
    ResumeUpdateView,
    MyResumeView,
    MyResumeMatchesView,
    CalculateResumeMatchView
)


urlpatterns = [

    path(
        'resume/upload/',
        ResumeUploadView.as_view(),
        name='resume-upload'
    ),

    path(
        'resume/update/',
        ResumeUpdateView.as_view(),
        name='resume-update'
    ),

    path(
        'resume/me/',
        MyResumeView.as_view(),
        name='my-resume'
    ),

    path(
        'resume/matches/',
        MyResumeMatchesView.as_view(),
        name='my-resume-matches'
    ),

    path(
        'resume/match/<int:job_id>/',
        CalculateResumeMatchView.as_view(),
        name='calculate-resume-match'
    ),
]