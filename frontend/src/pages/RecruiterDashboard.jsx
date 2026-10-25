import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
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
  screening: 'Screening',
  shortlisted: 'Shortlisted',
  interview: 'Interview',
  rejected: 'Rejected',
  hired: 'Selected',
}

function readUser() {
  try {
    return JSON.parse(localStorage.getItem('user'))
  } catch {
    return null
  }
}

function RecruiterDashboard() {
  const navigate = useNavigate()

  const token = localStorage.getItem('token')
  const user = readUser()

  const [jobs, setJobs] = useState([])
  const [applications, setApplications] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [roundsDraft, setRoundsDraft] = useState({})

  const [loading, setLoading] = useState(true)
  const [applicationsLoading, setApplicationsLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)

  const [error, setError] = useState('')
  const [applicationsError, setApplicationsError] = useState('')
  const [message, setMessage] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    if (!token || user?.role !== 'recruiter') {
      navigate('/login')
      return
    }

    loadJobs()
    loadApplications()
  }, [])

  // Load jobs posted by the current recruiter.
  async function loadJobs() {
    try {
      setError('')

      const response = await fetch(`${API}/jobs/mine/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(
          `Could not load your jobs (HTTP ${response.status}).`
        )
      }

      const data = await response.json()

      setJobs(
        Array.isArray(data) ? data : data.results || []
      )
    } catch (err) {
      setError(err.message || 'Unable to load your jobs.')
    } finally {
      setLoading(false)
    }
  }

  // Load applications received by the recruiter.
  async function loadApplications() {
    try {
      setApplicationsError('')

      const response = await fetch(
        `${API}/recruiter-applications/`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(
          `Could not load applicants (HTTP ${response.status}).`
        )
      }

      const data = await response.json()

      setApplications(
        Array.isArray(data) ? data : data.results || []
      )
    } catch (err) {
      setApplicationsError(
        err.message || 'Unable to load applications.'
      )
    } finally {
      setApplicationsLoading(false)
    }
  }

  // Update the job form when a field changes.
  function handleChange(event) {
    const { name, value } = event.target

    setForm(previous => ({
      ...previous,
      [name]: value,
    }))
  }

  // Create a new job.
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

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        const details = Object.values(data)
          .flat()
          .join(' ')

        throw new Error(details || 'Job posting failed.')
      }

      setForm(emptyForm)
      setMessage('Job posted successfully!')

      await loadJobs()
    } catch (err) {
      setError(err.message || 'Unable to post the job.')
    } finally {
      setSaving(false)
    }
  }

  // Update an application's status or interview rounds.
  async function updateApplication(applicationId, changes) {
    const application = applications.find(
      item => item.id === applicationId
    )

    if (!application) return

    const updatedStatus =
      changes.status ?? application.status ?? 'applied'

    const updatedRounds = Number(
      changes.interview_rounds ??
      application.interview_rounds ??
      0
    )

    if (
      !Number.isInteger(updatedRounds) ||
      updatedRounds < 0
    ) {
      setApplicationsError(
        'Interview rounds must be a non-negative integer.'
      )
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
        const details = Object.values(data)
          .flat()
          .join(' ')

        throw new Error(
          details || 'Could not update the application.'
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

      setRoundsDraft(previous => {
        const next = { ...previous }
        delete next[applicationId]
        return next
      })

      setStatusMessage('Application updated successfully.')
    } catch (err) {
      setApplicationsError(
        err.message || 'Unable to update the application.'
      )

      await loadApplications()
    } finally {
      setUpdatingId(null)
    }
  }

  // Count applications by their current status.
  function count(status) {
    return applications.filter(
      application =>
        (application.status || 'applied').toLowerCase() === status
    ).length
  }

  // Safely get a job title from an application.
  function getJobTitle(application) {
    if (application.job_title) {
      return application.job_title
    }

    if (
      application.job &&
      typeof application.job === 'object'
    ) {
      return application.job.title || 'Untitled job'
    }

    return application.job
      ? `Job #${application.job}`
      : 'Job not specified'
  }

  return (
    <div className="hf-recruiter">
      <Navbar />

      <main className="hf-rdash">

        {/* Dashboard heading */}
        <section className="hf-rhero">
          <div>
            <span className="hf-eyebrow">
              HIREFLOW / RECRUITER WORKSPACE
            </span>

            <h1>
              Good to see you, {user?.username || 'Recruiter'}.
            </h1>

            <p>
              Manage your openings, review candidates, and move
              great people forward.
            </p>
          </div>

          <a className="hf-primary-btn" href="#post-job">
            + Post a job
          </a>
        </section>

        {/* General error */}
        {error && (
          <div className="hf-alert" role="alert">
            {error}
          </div>
        )}

        {/* Dashboard statistics */}
        <section className="hf-stat-grid">
          <article className="hf-stat">
            <span>Posted jobs</span>
            <strong>{loading ? '—' : jobs.length}</strong>
            <small>Your posted opportunities</small>
          </article>

          <article className="hf-stat">
            <span>Total applications</span>
            <strong>
              {applicationsLoading ? '—' : applications.length}
            </strong>
            <small>Applications received</small>
          </article>

          <article className="hf-stat">
            <span>Shortlisted</span>
            <strong>
              {applicationsLoading ? '—' : count('shortlisted')}
            </strong>
            <small>Ready for next steps</small>
          </article>

          <article className="hf-stat">
            <span>Selected</span>
            <strong>
              {applicationsLoading ? '—' : count('hired')}
            </strong>
            <small>Successful candidates</small>
          </article>
        </section>

        {/* Quick navigation */}
        <section className="hf-section-head">
          <span className="hf-eyebrow">QUICK ACCESS</span>
          <h2>Your recruitment workspace</h2>
          <p>
            Access job management, applicants, and the public job board.
          </p>
        </section>

        <section className="hf-action-grid">
          <Link
            to="/recruiter/jobs"
            className="hf-action-card"
          >
            <span className="hf-action-icon">▤</span>
            <h3>My Posted Jobs</h3>
            <p>
              Manage the jobs you have published.
            </p>
            <span className="hf-action-link">
              Manage jobs <b>→</b>
            </span>
          </Link>

          <Link
            to="/recruiter/applicants"
            className="hf-action-card"
          >
            <span className="hf-action-icon">♙</span>
            <h3>Applicants & Interviews</h3>
            <p>
              Review candidates and manage recruitment progress.
            </p>
            <span className="hf-action-link">
              Review applicants <b>→</b>
            </span>
          </Link>

          <Link
            to="/jobs"
            className="hf-action-card"
          >
            <span className="hf-action-icon">↗</span>
            <h3>Candidate Job Board</h3>
            <p>
              View the public job board.
            </p>
            <span className="hf-action-link">
              View job board <b>→</b>
            </span>
          </Link>
        </section>

        {/* Post a job form */}
        <section className="hf-panel" id="post-job">
          <div className="hf-panel-head">
            <div>
              <span className="hf-eyebrow">CREATE OPENING</span>
              <h2>Post a New Job</h2>
              <p>
                Add the details of the position you want to advertise.
              </p>
            </div>
          </div>

          {message && (
            <div className="hf-success" role="status">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="hf-job-form">
            <div className="hf-form-grid">

              <label className="hf-form-field">
                Job Title *
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Software Engineer"
                  required
                />
              </label>

              <label className="hf-form-field">
                Company Name *
                <input
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="Company name"
                  required
                />
              </label>

              <label className="hf-form-field">
                Location *
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Pune"
                  required
                />
              </label>

              <label className="hf-form-field">
                Required Skills *
                <input
                  name="skills_required"
                  value={form.skills_required}
                  onChange={handleChange}
                  placeholder="Java, SQL, React"
                  required
                />
              </label>

              <label className="hf-form-field">
                Salary
                <input
                  name="salary"
                  value={form.salary}
                  onChange={handleChange}
                  placeholder="6 LPA"
                />
              </label>

              <label className="hf-form-field">
                Experience
                <input
                  name="experience"
                  value={form.experience}
                  onChange={handleChange}
                  placeholder="Fresher / 0–2 years"
                />
              </label>

              <label className="hf-form-field hf-form-full">
                Job Description *
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the responsibilities and requirements."
                  rows={5}
                  required
                />
              </label>

            </div>

            <button
              type="submit"
              className="hf-primary-btn"
              disabled={saving}
            >
              {saving ? 'Posting...' : 'Post Job'}
            </button>
          </form>
        </section>

        {/* Posted jobs */}
        <section className="hf-panel">
          <div className="hf-panel-head">
            <div>
              <span className="hf-eyebrow">YOUR OPENINGS</span>
              <h2>My Posted Jobs</h2>
            </div>

            <span className="hf-count">{jobs.length}</span>
          </div>

          {loading ? (
            <p className="hf-muted">Loading your jobs...</p>
          ) : jobs.length === 0 ? (
            <div className="hf-empty">
              <h3>No jobs posted yet</h3>
              <p>
                Use the form above to post your first job.
              </p>
            </div>
          ) : (
            <div className="hf-posted-list">
              {jobs.map(job => (
                <article className="hf-posted-job" key={job.id}>
                  <div className="hf-job-mark">
                    {(job.company || job.title || 'J')
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="hf-posted-job-main">
                    <h3>{job.title}</h3>

                    <p>
                      {job.company || 'Company not specified'}
                      {' · '}
                      {job.location || 'Location not specified'}
                    </p>

                    {job.skills_required && (
                      <div className="hf-tags">
                        {job.skills_required
                          .split(',')
                          .map(skill => skill.trim())
                          .filter(Boolean)
                          .map((skill, index) => (
                            <span key={`${skill}-${index}`}>
                              {skill}
                            </span>
                          ))}
                      </div>
                    )}

                    {job.salary && (
                      <small>Salary: {job.salary}</small>
                    )}

                    {job.experience && (
                      <p>Experience: {job.experience}</p>
                    )}

                    {job.description && (
                      <p className="hf-job-desc">
                        {job.description}
                      </p>
                    )}
                  </div>

                  <span className="hf-job-id">
                    Job #{job.id}
                  </span>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Recent applicants */}
        <section className="hf-panel">
          <div className="hf-panel-head">
            <div>
              <span className="hf-eyebrow">LATEST</span>
              <h2>Recent Applicants</h2>
            </div>

            <Link to="/recruiter/applicants">
              View all →
            </Link>
          </div>

          {applicationsLoading ? (
            <p className="hf-muted">
              Loading applicants...
            </p>
          ) : applicationsError ? (
            <div className="hf-alert" role="alert">
              {applicationsError}
            </div>
          ) : applications.length === 0 ? (
            <div className="hf-empty">
              <h3>No applications yet</h3>
              <p>
                Applications will appear here when candidates
                apply to your jobs.
              </p>
            </div>
          ) : (
            <div className="hf-table-wrap">
              <table className="hf-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Position</th>
                    <th>Status</th>
                    <th>Interview Rounds</th>
                  </tr>
                </thead>

                <tbody>
                  {applications.slice(0, 5).map(application => {
                    const status = (
                      application.status || 'applied'
                    ).toLowerCase()

                    return (
                      <tr key={application.id}>
                        <td>
                          <strong>
                            {application.candidate_name || 'Candidate'}
                          </strong>
                          <small>
                            Application #{application.id}
                          </small>
                        </td>

                        <td>{getJobTitle(application)}</td>

                        <td>
                          <span
                            className={`hf-status hf-status-${status}`}
                          >
                            {statusLabels[status] || status}
                          </span>
                        </td>

                        <td>
                          {application.interview_rounds ?? 0}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Manage application statuses */}
        <section className="hf-panel">
          <div className="hf-panel-head">
            <div>
              <span className="hf-eyebrow">CANDIDATE MANAGEMENT</span>
              <h2>Manage Applications</h2>
              <p>
                Update candidate status and completed interview rounds.
              </p>
            </div>
          </div>

          {statusMessage && (
            <div className="hf-success" role="status">
              {statusMessage}
            </div>
          )}

          {applicationsError && (
            <div className="hf-alert" role="alert">
              {applicationsError}
            </div>
          )}

          {applicationsLoading ? (
            <p className="hf-muted">
              Loading applications...
            </p>
          ) : applications.length === 0 ? (
            <div className="hf-empty">
              <h3>No applications to manage</h3>
              <p>
                Candidate applications will appear here.
              </p>
            </div>
          ) : (
            <div className="hf-table-wrap">
              <table className="hf-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Position</th>
                    <th>Update Status</th>
                    <th>Interview Rounds</th>
                  </tr>
                </thead>

                <tbody>
                  {applications.map(application => (
                    <tr key={application.id}>
                      <td>
                        <strong>
                          {application.candidate_name || 'Candidate'}
                        </strong>

                        <small>
                          Application #{application.id}
                        </small>

                        {application.phone && (
                          <small>
                            Phone: {application.phone}
                          </small>
                        )}

                        {application.resume && (
                          <small>
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
                          </small>
                        )}

                        {application.linkedin_url && (
                          <small>
                            <a
                              href={application.linkedin_url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              LinkedIn Profile
                            </a>
                          </small>
                        )}

                        {application.github_url && (
                          <small>
                            <a
                              href={application.github_url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              GitHub Profile
                            </a>
                          </small>
                        )}
                      </td>

                      <td>{getJobTitle(application)}</td>

                      <td>
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
                          <option value="screening">Screening</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="interview">Interview</option>
                          <option value="rejected">Rejected</option>
                          <option value="hired">Selected</option>
                        </select>
                      </td>

                      <td>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={
                            roundsDraft[application.id] ??
                            String(application.interview_rounds ?? 0)
                          }
                          disabled={updatingId === application.id}
                          aria-label={`Interview rounds for application ${application.id}`}
                          onChange={event => {
                            const value = event.target.value

                            setRoundsDraft(previous => ({
                              ...previous,
                              [application.id]: value,
                            }))
                          }}
                          onBlur={event => {
                            const rawValue = event.target.value.trim()
                            const rounds = Number(rawValue)

                            const currentRounds = Number(
                              application.interview_rounds ?? 0
                            )

                            if (
                              rawValue !== '' &&
                              Number.isInteger(rounds) &&
                              rounds >= 0
                            ) {
                              if (rounds !== currentRounds) {
                                updateApplication(application.id, {
                                  interview_rounds: rounds,
                                })
                              } else {
                                setRoundsDraft(previous => {
                                  const next = { ...previous }
                                  delete next[application.id]
                                  return next
                                })
                              }
                            } else {
                              setRoundsDraft(previous => ({
                                ...previous,
                                [application.id]: String(currentRounds),
                              }))
                            }
                          }}
                        />

                        {updatingId === application.id && (
                          <small>Saving...</small>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </main>
    </div>
  )
}

export default RecruiterDashboard