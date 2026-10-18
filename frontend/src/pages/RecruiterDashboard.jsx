
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

function RecruiterDashboard() {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

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

  useEffect(() => {
    if (!token || user?.role !== 'recruiter') {
      navigate('/login')
      return
    }

    loadJobs()
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  function handleChange(event) {
    const { name, value } = event.target
    setForm(previous => ({ ...previous, [name]: value }))
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
          Object.values(data).flat().join(' ') || 'Job posting failed.'
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
  <button type="button" onClick={handleLogout}>Logout</button>
</nav>
      </header>

      <main className="recruiter-container">
        <section className="recruiter-welcome">
          <h1>Recruiter Dashboard</h1>
          <p>
            Welcome, {user?.username || 'Recruiter'}! Manage your job openings here.
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

          {message && <p className="recruiter-success">{message}</p>}
          {error && <p className="recruiter-error" role="alert">{error}</p>}
        </section>

        <section className="recruiter-panel">
          <h2>My Posted Jobs ({jobs.length})</h2>

          {loading && <p>Loading your jobs...</p>}

          {!loading && jobs.length === 0 && (
            <p>No jobs posted yet. Post your first job above!</p>
          )}

          <div className="recruiter-job-list">
            {jobs.map(job => (
              <article className="recruiter-job-card" key={job.id}>
                <h3>{job.title}</h3>
                <p><strong>Company:</strong> {job.company}</p>
                <p><strong>Location:</strong> {job.location}</p>
                <p><strong>Skills:</strong> {job.skills_required}</p>
                {job.salary && <p><strong>Salary:</strong> {job.salary}</p>}
                {job.experience && (
                  <p><strong>Experience:</strong> {job.experience}</p>
                )}
                <p>{job.description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default RecruiterDashboard
