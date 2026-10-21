
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const API_URL = 'http://127.0.0.1:8000/api'

function MyApplications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')

    axios.get(`${API_URL}/my-applications/`, {
      headers: { Authorization: `Token ${token}` },
    })
      .then((response) => {
        const data = response.data
        setApplications(Array.isArray(data) ? data : data.results || [])
      })
      .catch((err) => {
        setError(
          err.response?.status === 401 || err.response?.status === 403
            ? 'Please log in with your candidate account.'
            : 'Could not load your applications.'
        )
      })
      .finally(() => setLoading(false))
  }, [])

  const statusColor = (status) => {
    const colors = {
      applied: '#2563eb',
      shortlisted: '#15803d',
      rejected: '#dc2626',
      hired: '#7c3aed',
    }
    return colors[status] || '#475569'
  }

  return (
    <main style={{ maxWidth: 1000, margin: '40px auto', padding: 20 }}>
      <Link to="/jobs">← Back to Jobs</Link>
      <h1>My Applications</h1>
      <p>Track the jobs you have applied for.</p>

      {loading && <p>Loading applications...</p>}
      {error && <p role="alert" style={{ color: 'crimson' }}>{error}</p>}

      {!loading && !error && applications.length === 0 && (
        <section>
          <h3>No applications yet</h3>
          <p>Your submitted job applications will appear here.</p>
          <Link to="/jobs">Explore Jobs</Link>
        </section>
      )}

      <div style={{ display: 'grid', gap: 16 }}>
        {applications.map((application) => (
          <article
            key={application.id}
            style={{
              padding: 20,
              border: '1px solid #e2e8f0',
              borderRadius: 12,
            }}
          >
            <h3>{application.job_title || `Job #${application.job}`}</h3>

            <p>
              Applied on:{' '}
              {application.applied_at
                ? new Date(application.applied_at).toLocaleDateString()
                : 'Date unavailable'}
            </p>

            <p>
              Status:{' '}
              <strong style={{
                color: statusColor(application.status),
                textTransform: 'capitalize',
              }}>
                {application.status}
              </strong>
            </p>

            {application.resume && (
              <p>
                Resume: {typeof application.resume === 'string'
                  ? application.resume.split('/').pop()
                  : 'Uploaded'}
              </p>
            )}

            {application.cover_letter && (
              <details>
                <summary>View cover letter</summary>
                <p>{application.cover_letter}</p>
              </details>
            )}
          </article>
        ))}
      </div>
    </main>
  )
}

export default MyApplications
