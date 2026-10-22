
from django.urls import path

from .views import (
    ApplyJobView,
    MyApplicationsView,
    RecruiterApplicationsView,
    UpdateApplicationStatusView,
    SavedJobsView,
    SavedJobDeleteView,
)

urlpatterns = [
    path(
        "jobs/<int:job_id>/apply/",
        ApplyJobView.as_view(),
        name="apply-job",
    ),
    path(
        "my-applications/",
        MyApplicationsView.as_view(),
        name="my-applications",
    ),
    path(
        "recruiter-applications/",
        RecruiterApplicationsView.as_view(),
        name="recruiter-applications",
    ),
    path(
        "applications/<int:pk>/status/",
        UpdateApplicationStatusView.as_view(),
        name="update-application-status",
    ),

    
path(
    "saved-jobs/",
    SavedJobsView.as_view(),
    name="saved-jobs",
),
path(
    "saved-jobs/<int:job_id>/",
    SavedJobDeleteView.as_view(),
    name="delete-saved-job",
),

]
