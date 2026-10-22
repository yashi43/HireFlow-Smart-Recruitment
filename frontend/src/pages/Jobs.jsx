
import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import '../styles/Jobs.css'

const API_URL = 'http://127.0.0.1:8000/api'

function getStoredUser() {
  try {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  } catch {
    return null
  }
}

function getJobId(application) {
  const job = application?.job

  return Number(
    typeof job === 'object' && job !== null
      ? job.id
      : job ?? application?.job_id
  )
}

function getErrorMessage(err, fallback) {
  const data = err.response?.data

  if (typeof data === 'string') return data

  if (data && typeof data === 'object') {
    return Object.entries(data)
      .map(([key, value]) => {
        const message = Array.isArray(value)
          ? value.join(', ')
          : typeof value === 'object'
            ? JSON.stringify(value)
            : String(value)

        return `${key}: ${message}`
      })
      .join(' | ') || fallback
  }

  return fallback
}

function Jobs() {
  const navigate = useNavigate()

  const [jobs, setJobs] = useState([])
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('All locations')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [savedJobIds, setSavedJobIds] = useState([])
  const [saveError, setSaveError] = useState('')
  const [savingJobId, setSavingJobId] = useState(null)

  const [appliedJobIds, setAppliedJobIds] = useState([])
  const [applicationsLoading, setApplicationsLoading] = useState(false)
  const [applicationError, setApplicationError] = useState('')

  const [currentUser, setCurrentUser] = useState(getStoredUser)

  const token = localStorage.getItem('token')
  const isLoggedIn = Boolean(token && currentUser)
  const isCandidate =
    isLoggedIn && currentUser.role === 'candidate'

  const authHeaders = useCallback(() => ({
    Authorization: `Token ${localStorage.getItem('token')}`,
  }), [])

  // Load all available jobs
  useEffect(() => {
    let cancelled = false

    axios.get(`${API_URL}/jobs/`)
      .then((response) => {
        const data = response.data

        if (!cancelled) {
          setJobs(
            Array.isArray(data)
              ? data
              : data.results || []
          )
        }
      })
      .catch((err) => {
        console.error(
          'Loading jobs failed:',
          err.response?.data || err
        )

        if (!cancelled) {
          setError(
            'Could not load jobs. Check whether the backend is running.'
          )
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  // Load saved jobs
  useEffect(() => {
    if (!isCandidate || !token) {
      setSavedJobIds([])
      setSaveError('')
      return
    }

    let cancelled = false

    axios.get(`${API_URL}/saved-jobs/`, {
      headers: authHeaders(),
    })
      .then((response) => {
        if (cancelled) return

        const data = response.data
        const savedJobs = Array.isArray(data)
          ? data
          : data.results || []

        setSavedJobIds(
          savedJobs
            .map((item) =>
              Number(item.job_id ?? item.job?.id ?? item.job)
            )
            .filter(Number.isFinite)
        )
      })
      .catch((err) => {
        console.error(
          'Loading saved jobs failed:',
          err.response?.data || err
        )

        if (!cancelled) {
          setSaveError(
            'Could not load saved jobs. Please check the backend API.'
          )
        }
      })

    return () => {
      cancelled = true
    }
  }, [isCandidate, token, authHeaders])

  // Load applications already submitted by this candidate
  useEffect(() => {
    if (!isCandidate || !token) {
      setAppliedJobIds([])
      setApplicationError('')
      return
    }

    let cancelled = false

    setApplicationsLoading(true)
    setApplicationError('')

    axios.get(`${API_URL}/my-applications/`, {
      headers: authHeaders(),
    })
      .then((response) => {
        if (cancelled) return

        const data = response.data
        const applications = Array.isArray(data)
          ? data
          : data.results || []

        const ids = applications
          .map(getJobId)
          .filter((id) => Number.isFinite(id) && id > 0)

        setAppliedJobIds([...new Set(ids)])
      })
      .catch((err) => {
        console.error(
          'Loading applications failed:',
          err.response?.status,
          err.response?.data || err
        )

        if (!cancelled) {
          setApplicationError(
            'Application status could not be loaded. Please refresh or check the API.'
          )
        }
      })
      .finally(() => {
        if (!cancelled) {
          setApplicationsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [isCandidate, token, authHeaders])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    setCurrentUser(null)
    setSavedJobIds([])
    setAppliedJobIds([])

    navigate('/login')
  }

  // Navigate to the application form
  const handleApply = (jobId) => {
    const savedToken = localStorage.getItem('token')
    const savedUser = getStoredUser()

    if (!savedToken || !savedUser) {
      navigate('/login')
      return
    }

    setCurrentUser(savedUser)

    if (savedUser.role !== 'candidate') {
      alert('Only candidate accounts can apply for jobs.')
      return
    }

    if (appliedJobIds.includes(Number(jobId))) {
      return
    }

    navigate(`/apply/${jobId}`)
  }

  // Save or remove a job
  const handleSaveJob = async (jobId) => {
    const savedToken = localStorage.getItem('token')
    const savedUser = getStoredUser()

    if (!savedToken || !savedUser) {
      navigate('/login')
      return
    }

    if (savedUser.role !== 'candidate') {
      setSaveError('Only candidate accounts can save jobs.')
      return
    }

    setSavingJobId(jobId)
    setSaveError('')

    const alreadySaved = savedJobIds.includes(Number(jobId))

    try {
      if (alreadySaved) {
        await axios.delete(
          `${API_URL}/saved-jobs/${jobId}/`,
          {
            headers: {
              Authorization: `Token ${savedToken}`,
            },
          }
        )

        setSavedJobIds((previous) =>
          previous.filter((id) => id !== Number(jobId))
        )
      } else {
        await axios.post(
          `${API_URL}/saved-jobs/`,
          { job: jobId },
          {
            headers: {
              Authorization: `Token ${savedToken}`,
              'Content-Type': 'application/json',
            },
          }
        )

        setSavedJobIds((previous) =>
          previous.includes(Number(jobId))
            ? previous
            : [...previous, Number(jobId)]
        )
      }
    } catch (err) {
      console.error(
        'Saving job failed:',
        err.response?.data || err
      )

      setSaveError(
        getErrorMessage(
          err,
          'Could not update saved jobs. Please try again.'
        )
      )
    } finally {
      setSavingJobId(null)
    }
  }

  const locations = [
    ...new Set(
      jobs.map((job) => job.location).filter(Boolean)
    ),
  ]

  const filteredJobs = jobs.filter((job) => {
    const searchableText =
      `${job.title || ''} ${job.company || ''} ${job.skills_required || ''}`
        .toLowerCase()

    return (
      searchableText.includes(search.toLowerCase()) &&
      (
        location === 'All locations' ||
        job.location === location
      )
    )
  })

  return (
    <div className="jobs-page">
      <header className="jobs-header">
        <Link to="/" className="logo">
          Hire<span>Flow</span>
        </Link>

        <nav>
          <Link to="/">Home</Link>
          <Link to="/jobs">Find Jobs</Link>

          {isCandidate && (
            <>
              <Link to="/my-applications">
                My Applications
              </Link>

              <Link to="/saved-jobs">
                Saved Jobs ({savedJobIds.length})
              </Link>
            </>
          )}

          {isLoggedIn ? (
            <>
              <span>Hi, {currentUser.username}</span>

              <button
                type="button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>

              <Link to="/register" className="signup-btn">
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </header>

      <section className="jobs-banner">
        <p className="hero-tag">
          YOUR NEXT OPPORTUNITY STARTS HERE
        </p>

        <h1>Find a job you'll love.</h1>

        <p>
          Explore opportunities, discover your strengths and take
          the next step in your career.
        </p>

        <div className="jobs-search">
          <input
            type="text"
            placeholder="Job title, company or skill"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <select
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          >
            <option value="All locations">
              All locations
            </option>

            {locations.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </section>

      <main className="jobs-content">
        <div className="jobs-heading">
          <div>
            <h2>Explore opportunities</h2>
            <p>
              Find the role that matches your career goals.
            </p>
          </div>

          {!loading && !error && (
            <span>{filteredJobs.length} jobs found</span>
          )}
        </div>

        {error && (
          <p className="no-jobs" role="alert">
            {error}
          </p>
        )}

        {saveError && (
          <p
            role="alert"
            style={{ color: 'crimson', marginBottom: 16 }}
          >
            {saveError}
          </p>
        )}

        {applicationError && isCandidate && (
          <p
            role="alert"
            style={{ color: 'crimson', marginBottom: 16 }}
          >
            {applicationError}
          </p>
        )}

        {applicationsLoading && isCandidate && (
          <p>Checking your application status...</p>
        )}

        {loading && <p>Loading jobs...</p>}

        {!loading && !error && (
          <div className="jobs-grid">
            {filteredJobs.map((job) => {
              const skills = (job.skills_required || '')
                .split(',')
                .map((skill) => skill.trim())
                .filter(Boolean)

              const isSaved = savedJobIds.includes(
                Number(job.id)
              )

              const isApplied = appliedJobIds.includes(
                Number(job.id)
              )

              return (
                <article
                  className="job-card"
                  key={job.id}
                >
                  <div className="job-card-top">
                    <div className="company-avatar">
                      {(job.company || 'C').charAt(0)}
                    </div>

                    <span className="job-type">
                      {job.experience ||
                        'Experience not specified'}
                    </span>
                  </div>

                  <h3>{job.title}</h3>

                  <p className="job-company">
                    {job.company}
                  </p>

                  <div className="job-meta">
                    <span>📍 {job.location}</span>

                    <span>
                      💼 {job.experience || 'Not specified'}
                    </span>
                  </div>

                  <p className="job-description">
                    {job.description}
                  </p>

                  <div className="job-skills">
                    {skills.map((skill) => (
                      <span key={skill}>{skill}</span>
                    ))}
                  </div>

                  <div className="job-card-bottom">
                    <div>
                      <strong>
                        {job.salary || 'Not specified'}
                      </strong>
                      <p>Salary</p>
                    </div>

                    <button
                      type="button"
                      className="job-details-btn"
                      disabled={
                        isCandidate &&
                        (isApplied || applicationsLoading)
                      }
                      onClick={() => handleApply(job.id)}
                      style={
                        isApplied
                          ? {
                              background: '#ecfdf5',
                              color: '#047857',
                              borderColor: '#a7f3d0',
                              cursor: 'default',
                            }
                          : undefined
                      }
                    >
                      {isApplied
                        ? '✓ Applied'
                        : isLoggedIn
                          ? 'Apply Now →'
                          : 'Login to Apply →'}
                    </button>
                  </div>

                  {isCandidate && (
                    <button
                      type="button"
                      onClick={() => handleSaveJob(job.id)}
                      disabled={savingJobId === job.id}
                      style={{
                        marginTop: 12,
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #d1d5db',
                        borderRadius: 8,
                        background: isSaved
                          ? '#ecfdf5'
                          : '#ffffff',
                        color: isSaved
                          ? '#047857'
                          : '#374151',
                        cursor:
                          savingJobId === job.id
                            ? 'wait'
                            : 'pointer',
                      }}
                    >
                      {savingJobId === job.id
                        ? 'Please wait...'
                        : isSaved
                          ? '♥ Saved — Remove'
                          : '♡ Save Job'}
                    </button>
                  )}
                </article>
              )
            })}
          </div>
        )}

        {!loading && !error && filteredJobs.length === 0 && (
          <div className="no-jobs">
            <h3>No matching jobs found</h3>
            <p>
              Try another job title, skill or location.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

export default Jobs
