
import { useEffect, useState } from 'react'
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

function Jobs() {
  const navigate = useNavigate()

  const [jobs, setJobs] = useState([])
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('All locations')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
const [currentUser, setCurrentUser] = useState(getStoredUser)

  const token = localStorage.getItem('token')
  const isLoggedIn = Boolean(token && currentUser)

  useEffect(() => {
    let cancelled = false

    axios.get(`${API_URL}/jobs/`)
      .then((response) => {
        const data = response.data
        if (!cancelled) {
          setJobs(Array.isArray(data) ? data : data.results || [])
        }
      })
      .catch((err) => {
        console.error('Error fetching jobs:', err)
        if (!cancelled) {
          setError('Could not load jobs. Please check that the backend is running.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setCurrentUser(null)
    navigate('/login')
  }

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

    navigate(`/apply/${jobId}`)
  }

  const locations = [
    ...new Set(jobs.map((job) => job.location).filter(Boolean)),
  ]

  const filteredJobs = jobs.filter((job) => {
    const searchableText =
      `${job.title || ''} ${job.company || ''} ${job.skills_required || ''}`.toLowerCase()

    return (
      searchableText.includes(search.toLowerCase()) &&
      (location === 'All locations' || job.location === location)
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

          {isLoggedIn ? (
            <>
              <span>Hi, {currentUser.username}</span>
              <button type="button" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="signup-btn">Sign Up</Link>
            </>
          )}
        </nav>
      </header>

      <section className="jobs-banner">
        <p className="hero-tag">YOUR NEXT OPPORTUNITY STARTS HERE</p>
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
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            <option value="All locations">All locations</option>
            {locations.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>
      </section>

      <main className="jobs-content">
        <div className="jobs-heading">
          <div>
            <h2>Explore opportunities</h2>
            <p>Find the role that matches your career goals.</p>
          </div>

          {!loading && !error && <span>{filteredJobs.length} jobs found</span>}
        </div>

        {loading && <p>Loading jobs...</p>}
        {error && <p className="no-jobs">{error}</p>}

        {!loading && !error && (
          <div className="jobs-grid">
            {filteredJobs.map((job) => {
              const skills = (job.skills_required || '')
                .split(',')
                .map((skill) => skill.trim())
                .filter(Boolean)

            return (
                <article className="job-card" key={job.id}>
                  <div className="job-card-top">
                    <div className="company-avatar">
                      {(job.company || 'C').charAt(0)}
                  </div>
                    <span className="job-type">
                      {job.experience || 'Experience not specified'}
                    </span>
                  </div>

                  <h3>{job.title}</h3>
                  <p className="job-company">{job.company}</p>

                  <div className="job-meta">
                    <span>📍 {job.location}</span>
                    <span>💼 {job.experience || 'Not specified'}</span>
                  </div>

                  <p className="job-description">{job.description}</p>

                  <div className="job-skills">
                    {skills.map((skill) => (
                      <span key={skill}>{skill}</span>
                    ))}
                  </div>

                  <div className="job-card-bottom">
                    <div>
                      <strong>{job.salary || 'Not specified'}</strong>
                      <p>Salary</p>
                    </div>

                    <button
                      type="button"
                      className="job-details-btn"
                      onClick={() => handleApply(job.id)}
                  >
                      {isLoggedIn ? 'Apply Now →' : 'Login to Apply →'}
                    </button>
                  </div>
                 </article>
              )
            })}
          </div>
        )}

        {!loading && !error && filteredJobs.length === 0 && (
          <div className="no-jobs">
            <h3>No matching jobs found</h3>
            <p>Try another job title, skill or location.</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default Jobs
