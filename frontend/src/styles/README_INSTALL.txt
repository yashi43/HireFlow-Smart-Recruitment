HIREFLOW FRONTEND UI UPDATE - INSTALLATION

IMPORTANT:
1. Make a copy/backup of your current frontend/src folder first.
2. Keep your Django backend running.
3. This ZIP contains replacement files. Copy them into frontend/src, keeping the folder structure.
4. It replaces App.jsx, RecruiterDashboard.jsx, MyApplications.jsx and RecruiterDashboard.css.
5. It adds RecruiterJobs.jsx, ManageApplicants.jsx and the related CSS files.

Files included:
src/App.jsx
src/pages/RecruiterDashboard.jsx
src/pages/RecruiterJobs.jsx
src/pages/ManageApplicants.jsx
src/pages/MyApplications.jsx
src/styles/RecruiterDashboard.css
src/styles/RecruiterJobs.css
src/styles/ManageApplicants.css
src/styles/MyApplications.css

Routes added:
- /recruiter
- /recruiter/jobs
- /recruiter/applicants

API endpoints expected (based on the existing project code):
- GET /api/jobs/mine/
- POST /api/jobs/
- GET /api/recruiter-applications/
- PATCH /api/applications/<id>/status/
- GET /api/my-applications/

Status values used by this frontend:
applied, screening, shortlisted, interview, hired, rejected

BACKEND NOTE:
The frontend sends status and interview_rounds together in PATCH requests. Your backend status serializer must accept both fields, and the recruiter applications endpoint must return interview_rounds and candidate/job display fields.
The frontend's interview timeline maps status values for display; if the backend rejects "screening" or "interview", remove those options from ManageApplicants.jsx or add them to the model choices/serializer.
