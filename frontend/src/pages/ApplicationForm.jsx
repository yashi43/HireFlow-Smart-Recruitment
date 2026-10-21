
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'

const API_URL = 'http://127.0.0.1:8000/api'

function ApplicationForm() {
  const { jobId } = useParams()
  const navigate = useNavigate()

  const [resume, setResume] = useState(null)
  const [phone, setPhone] = useState('')
  const [coverLetter, setCoverLetter] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [github, setGithub] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    const token = localStorage.getItem('token')

    if (!token) {
      navigate('/login')
      return
    }

    if (!resume) {
      setError('Please upload your resume.')
      return
    }

    if (!/\.(pdf|doc|docx)$/i.test(resume.name)) {
      setError('Please upload a PDF, DOC or DOCX file.')
      return
    }

    if (resume.size > 5 * 1024 * 1024) {
      setError('Resume must be 5 MB or smaller.')
      return
    }

    const formData = new FormData()
    formData.append('resume', resume)
    formData.append('phone', phone)
    formData.append('cover_letter', coverLetter)
    formData.append('linkedin_url', linkedin)
    formData.append('github_url', github)

    setLoading(true)

    try {
      await axios.post(
        `${API_URL}/jobs/${jobId}/apply/`,
        formData,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      )

      setSuccess(true)
    } catch (err) {
      console.error('Application submission failed:', err.response?.data || err)

      const data = err.response?.data
      let message = 'Application failed. Please try again.'

      if (typeof data === 'string') {
        message = data
      } else if (data) {
        message = Object.entries(data)
          .map(([key, value]) => {
            const detail = Array.isArray(value)
              ? value.join(', ')
              : typeof value === 'object'
                ? JSON.stringify(value)
                : String(value)

            return `${key}: ${detail}`
          })
          .join(' | ')
      } else if (err.message) {
        message = err.message
      }

      setError(message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <main style={{ maxWidth: 650, margin: '60px auto', padding: 24 }}>
        <h1>Application submitted!</h1>
        <p>Your application has been saved successfully.</p>
        <button type="button" onClick={() => navigate('/jobs')}>
          Back to Jobs
        </button>
      </main>
    )
  }

  return (
    <main style={{
      maxWidth: 650,
      margin: '40px auto',
      padding: 28,
      background: '#ffffff',
      borderRadius: 12,
      boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    }}>
      <h1>Apply for this job</h1>
      <p>Complete your details and upload your resume.</p>

      <form onSubmit={handleSubmit}>
        <label style={{ display: 'block', marginTop: 20 }}>
          Phone number
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={20}
            style={{ display: 'block', width: '100%', padding: 12, marginTop: 8 }}
          />
        </label>

        <label style={{ display: 'block', marginTop: 20 }}>
          Resume (PDF, DOC or DOCX, maximum 5 MB) *
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            required
            onChange={(e) => setResume(e.target.files?.[0] || null)}
            style={{ display: 'block', marginTop: 8 }}
          />
        </label>

        {resume && (
          <p>Selected file: {resume.name}</p>
        )}

        <label style={{ display: 'block', marginTop: 20 }}>
          Cover letter
          <textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            rows={5}
            style={{ display: 'block', width: '100%', padding: 12, marginTop: 8 }}
          />
        </label>

        <label style={{ display: 'block', marginTop: 20 }}>
          LinkedIn profile URL
          <input
            type="url"
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
            style={{ display: 'block', width: '100%', padding: 12, marginTop: 8 }}
          />
        </label>

        <label style={{ display: 'block', marginTop: 20 }}>
          GitHub profile URL
          <input
            type="url"
            value={github}
            onChange={(e) => setGithub(e.target.value)}
            style={{ display: 'block', width: '100%', padding: 12, marginTop: 8 }}
          />
        </label>

        {error && (
          <p role="alert" style={{ color: 'crimson', marginTop: 18 }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{ marginTop: 24, padding: '12px 22px', cursor: 'pointer' }}
        >
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>

        <button
          type="button"
          onClick={() => navigate('/jobs')}
          style={{ marginLeft: 12, padding: '12px 22px' }}
        >
          Cancel
        </button>
      </form>
    </main>
  )
}

export default ApplicationForm
