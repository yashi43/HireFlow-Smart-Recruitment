
from django.urls import path

from .views import JobListCreateView, JobDetailView, MyJobsView

urlpatterns = [
    path("jobs/", JobListCreateView.as_view(), name="job-list-create"),
    path("jobs/mine/", MyJobsView.as_view(), name="my-jobs"),
    path("jobs/<int:pk>/", JobDetailView.as_view(), name="job-detail"),
]
