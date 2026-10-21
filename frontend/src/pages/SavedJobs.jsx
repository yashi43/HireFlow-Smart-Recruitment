
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const API_URL = 'http://127.0.0.1:8000/api'

function SavedJobs() {
  const [savedJobs, setSavedJobs] = useState([])
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadSavedJobs = async () => {
    const token = localStorage.getItem('token')

    try {
      const [savedResponse, jobsResponse] = await Promise.all([
        axios.get(`${API_URL}/saved-jobs/`, {
          headers: { Authorization: `Token ${token}` },
        }),
        axios.get(`${API_URL}/jobs/`),
      ])

      const savedData = savedResponse.data
      const jobsData = jobsResponse.data

      setSavedJobs(Array.isArray(savedData) ? savedData : savedData.results || [])
      setJobs(Array.isArray(jobsData) ? jobsData : jobsData.results || [])
    } catch (err) {
      setError(
        err.response?.status === 401 || err.response?.status === 403
          ? 'Please log in with your candidate account.'
          : 'Could not load saved jobs.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSavedJobs()
  }, [])

  const removeSavedJob = async (jobId) => {
    const token = localStorage.getItem('token')

    try {
      await axios.delete(`${API_URL}/saved-jobs/${jobId}/`, {
        headers: { Authorization: `Token ${token}` },
      })

      setSavedJobs((previous) =>
        previous.filter((saved) => saved.job !== jobId)
      )
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not remove saved job.')
    }
  }

  const savedJobCards = savedJobs.map((saved) => {
    const job = jobs.find((item) => item.id === saved.job)

    return { ...saved, details: job }
  })

  return (
    <main style={{ maxWidth: 1000, margin: '40px auto', padding: 20 }}>
      <Link to="/jobs">← Back to Jobs</Link>
      <h1>Saved Jobs</h1>
      <p>Your bookmarked opportunities, saved to your account.</p>

      {loading && <p>Loading saved jobs...</p>}
      {error && <p role="alert" style={{ color: 'crimson' }}>{error}</p>}

      {!loading && !error && savedJobs.length === 0 && (
        <section>
          <h3>No saved jobs yet</h3>
          <p>Save a job to find it quickly later.</p>
          <Link to="/jobs">Explore Jobs</Link>
        </section>
      )}

      <div style={{ display: 'grid', gap: 16 }}>
        {savedJobCards.map((saved) => {
          const job = saved.details

          return (
            <article
              key={saved.id}
              style={{
                padding: 20,
                border: '1px solid #e2e8f0',
                borderRadius: 12,
              }}
            >
              <h3>{job?.title || saved.job_title || `Job #${saved.job}`}</h3>
              {job && (
                <>
                  <p>{job.company} · {job.location}</p>
                  <p>{job.salary || 'Salary not specified'}</p>
                  <p>{job.description}</p>
                </>
              )}

              <button
                type="button"
                onClick={() => removeSavedJob(saved.job)}
              >
                Remove from Saved Jobs
              </button>
            </article>
          )
        })}
      </div>
    </main>
  )
}

export default SavedJobs
