
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../styles/RecruiterDashboard.css'

const API = 'http://127.0.0.1:8000/api'

const emptyForm = {
  title: '',
  company: '',
  location: '',
  description: '',
  skills_required: '',
  salary: '',
  experience: '',
}

const statusLabels = {
  applied: 'Applied',
  shortlisted: 'Shortlisted',
  rejected: 'Rejected',
  hired: 'Selected',
}

function RecruiterDashboard() {
  const navigate = useNavigate()

  const [jobs, setJobs] = useState([])
  const [applications, setApplications] = useState([])
  const [form, setForm] = useState(emptyForm)

  const [loading, setLoading] = useState(true)
  const [applicationsLoading, setApplicationsLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [applicationsError, setApplicationsError] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  const token = localStorage.getItem('token')

  let user = null

  try {
    user = JSON.parse(localStorage.getItem('user'))
  } catch {
    user = null
  }

  async function loadJobs() {
    const response = await fetch(`${API}/jobs/mine/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Unable to load jobs. Please check your login.')
    }

    const data = await response.json()
    setJobs(Array.isArray(data) ? data : data.results || [])
  }

  async function loadApplications() {
    setApplicationsError('')

    try {
      const response = await fetch(`${API}/recruiter-applications/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(
          `Unable to load applications (HTTP ${response.status}).`
        )
      }

      const data = await response.json()

      setApplications(
        Array.isArray(data) ? data : data.results || []
      )
    } catch (err) {
      setApplicationsError(err.message)
    } finally {
      setApplicationsLoading(false)
    }
  }

  useEffect(() => {
    if (!token || user?.role !== 'recruiter') {
      navigate('/login')
      return
    }

    loadJobs()
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))

    loadApplications()
  }, [])

  function handleChange(event) {
    const { name, value } = event.target

    setForm(previous => ({
      ...previous,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setSaving(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch(`${API}/jobs/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(form),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          Object.values(data).flat().join(' ') ||
          'Job posting failed.'
        )
      }

      setForm(emptyForm)
      setMessage('Job posted successfully!')
      await loadJobs()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function updateApplication(applicationId, changes) {
    const application = applications.find(
      item => item.id === applicationId
    )

    if (!application) return

    const updatedStatus = changes.status ?? application.status ?? 'applied'
    const updatedRounds = Number(
      changes.interview_rounds ?? application.interview_rounds ?? 0
    )

    if (!Number.isInteger(updatedRounds) || updatedRounds < 0) {
      setApplicationsError('Interview rounds must be a non-negative integer.')
      return
    }

    setUpdatingId(applicationId)
    setApplicationsError('')
    setStatusMessage('')

    try {
      const response = await fetch(
        `${API}/applications/${applicationId}/status/`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({
            status: updatedStatus,
            interview_rounds: updatedRounds,
          }),
        }
      )

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(
          Object.values(data).flat().join(' ') ||
          'Could not update the application.'
        )
      }

      setApplications(previous =>
        previous.map(item =>
          item.id === applicationId
            ? {
                ...item,
                status: updatedStatus,
                interview_rounds: updatedRounds,
              }
            : item
        )
      )

      setStatusMessage('Application updated successfully.')
    } catch (err) {
      setApplicationsError(err.message)
      await loadApplications()
    } finally {
      setUpdatingId(null)
    }
  }

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div className="recruiter-page">
      <header className="recruiter-header">
        <Link to="/" className="recruiter-logo">
          Hire<span>Flow</span>
        </Link>

        <nav>
          <Link to="/">Home</Link>
          <button type="button" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      </header>

      <main className="recruiter-container">
        <section className="recruiter-welcome">
          <h1>Recruiter Dashboard</h1>
          <p>
            Welcome, {user?.username || 'Recruiter'}! Manage your job
            openings and review candidates here.
          </p>
        </section>

        <section className="recruiter-panel">
          <h2>Post a New Job</h2>

          <form className="recruiter-form" onSubmit={handleSubmit}>
            <label>
              Job Title *
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Software Engineer"
                required
              />
            </label>

            <label>
              Company Name *
              <input
                name="company"
                value={form.company}
                onChange={handleChange}
                placeholder="Company name"
                required
              />
            </label>

            <label>
              Location *
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Pune"
                required
              />
            </label>

            <label>
              Required Skills *
              <input
                name="skills_required"
                value={form.skills_required}
                onChange={handleChange}
                placeholder="Java, SQL, React"
                required
              />
            </label>

            <label>
              Salary
              <input
                name="salary"
                value={form.salary}
                onChange={handleChange}
                placeholder="6 LPA"
              />
            </label>

            <label>
              Experience
              <input
                name="experience"
                value={form.experience}
                onChange={handleChange}
                placeholder="Fresher / 0-2 years"
              />
            </label>

            <label className="recruiter-full-width">
              Job Description *
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe responsibilities and requirements"
                rows={5}
                required
              />
            </label>

            <button
              type="submit"
              className="recruiter-submit"
              disabled={saving}
            >
              {saving ? 'Posting...' : 'Post Job'}
            </button>
          </form>

          {message && (
            <p className="recruiter-success">{message}</p>
          )}

          {error && (
            <p className="recruiter-error" role="alert">
              {error}
            </p>
          )}
        </section>

        <section className="recruiter-panel">
          <h2>My Posted Jobs ({jobs.length})</h2>

          {loading && <p>Loading your jobs...</p>}

          {!loading && jobs.length === 0 && (
            <p>No jobs posted yet. Post your first job above!</p>
          )}

          <div className="recruiter-job-list">
            {jobs.map(job => (
              <article
                className="recruiter-job-card"
                key={job.id}
              >
                <h3>{job.title}</h3>
                <p><strong>Company:</strong> {job.company}</p>
                <p><strong>Location:</strong> {job.location}</p>
                <p><strong>Skills:</strong> {job.skills_required}</p>

                {job.salary && (
                  <p><strong>Salary:</strong> {job.salary}</p>
                )}

                {job.experience && (
                  <p><strong>Experience:</strong> {job.experience}</p>
                )}

                <p>{job.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="recruiter-panel">
          <h2>Applications Received ({applications.length})</h2>
          <p>Review candidates and manage their recruitment progress.</p>

          {applicationsLoading && <p>Loading applications...</p>}

          {applicationsError && (
            <p className="recruiter-error" role="alert">
              {applicationsError}
            </p>
          )}

          {statusMessage && (
            <p className="recruiter-success" role="status">
              {statusMessage}
            </p>
          )}

          {!applicationsLoading &&
            !applicationsError &&
            applications.length === 0 && (
              <p>No applications received yet.</p>
            )}

          <div className="recruiter-job-list">
            {applications.map(application => (
              <article
                className="recruiter-job-card"
                key={application.id}
              >
                <h3>
                  {application.candidate_name || 'Candidate'}
                </h3>

                <p>
                  <strong>Applied for:</strong>{' '}
                  {application.job_title ||
                    (typeof application.job === 'object'
                      ? application.job?.title
                      : '') ||
                    `Job ID ${application.job}`}
                </p>

                <p>
                  <strong>Application ID:</strong> {application.id}
                </p>

                {application.phone && (
                  <p>
                    <strong>Phone:</strong> {application.phone}
                  </p>
                )}

                {application.cover_letter && (
                  <p>
                    <strong>Cover Letter:</strong>{' '}
                    {application.cover_letter}
                  </p>
                )}

                {application.linkedin_url && (
                  <p>
                    <strong>LinkedIn:</strong>{' '}
                    <a
                      href={application.linkedin_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View Profile
                    </a>
                  </p>
                )}

                {application.github_url && (
                  <p>
                    <strong>GitHub:</strong>{' '}
                    <a
                      href={application.github_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View Profile
                    </a>
                  </p>
                )}

                {application.resume && (
                  <p>
                    <strong>Resume:</strong>{' '}
                    <a
                      href={
                        application.resume.startsWith('http')
                          ? application.resume
                          : `http://127.0.0.1:8000${application.resume}`
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      View Resume
                    </a>
                  </p>
                )}

                <p>
                  <strong>Current Status:</strong>{' '}
                  {statusLabels[application.status] ||
                    application.status ||
                    'Applied'}
                </p>

                <label>
                  Update Candidate Status
                  <select
                    value={application.status || 'applied'}
                    disabled={updatingId === application.id}
                    onChange={event =>
                      updateApplication(application.id, {
                        status: event.target.value,
                      })
                    }
                  >
                    <option value="applied">Applied</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="rejected">Rejected</option>
                    <option value="hired">Selected</option>
                  </select>
                </label>

                <label>
                  Interview Rounds Completed
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={application.interview_rounds ?? 0}
                    disabled={updatingId === application.id}
                    onChange={event => {
                      const value = event.target.value
                      const rounds = value === '' ? '' : Number(value)

                      setApplications(previous =>
                        previous.map(item =>
                          item.id === application.id
                            ? {
                                ...item,
                                interview_rounds: rounds,
                              }
                            : item
                        )
                      )
                    }}
                    onBlur={event => {
                      const rounds = Number(event.target.value)

                      if (
                        Number.isInteger(rounds) &&
                        rounds >= 0
                      ) {
                        updateApplication(application.id, {
                          interview_rounds: rounds,
                        })
                      } else {
                        loadApplications()
                      }
                    }}
                  />
                </label>

                {updatingId === application.id && (
                  <p>Saving changes...</p>
                )}
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default RecruiterDashboard
