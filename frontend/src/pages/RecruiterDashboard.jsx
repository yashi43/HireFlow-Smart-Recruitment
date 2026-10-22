import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import '../styles/RecruiterDashboard.css'

const API = 'http://127.0.0.1:8000/api'

function readUser() {
  try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
}

function RecruiterDashboard() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const user = readUser()
  const [jobs, setJobs] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token || user?.role !== 'recruiter') {
      navigate('/login')
      return
    }
    Promise.all([
      fetch(`${API}/jobs/mine/`, { headers: { Authorization: `Token ${token}` } }),
      fetch(`${API}/recruiter-applications/`, { headers: { Authorization: `Token ${token}` } }),
    ])
      .then(async ([jobsRes, appsRes]) => {
        if (!jobsRes.ok) throw new Error(`Could not load your jobs (HTTP ${jobsRes.status}).`)
        if (!appsRes.ok) throw new Error(`Could not load applicants (HTTP ${appsRes.status}).`)
        const [jobsData, appsData] = await Promise.all([jobsRes.json(), appsRes.json()])
        setJobs(Array.isArray(jobsData) ? jobsData : jobsData.results || [])
        setApplications(Array.isArray(appsData) ? appsData : appsData.results || [])
      })
      .catch(err => setError(err.message || 'Unable to load recruiter dashboard.'))
      .finally(() => setLoading(false))
  }, [])

  const count = status => applications.filter(a => (a.status || 'applied').toLowerCase() === status).length

  return (
    <div className="hf-recruiter">
      <Navbar />
      <main className="hf-rdash">
        <section className="hf-rhero">
          <div>
            <span className="hf-eyebrow">HIREFLOW / RECRUITER WORKSPACE</span>
            <h1>Good to see you, {user?.username || 'Recruiter'}.</h1>
            <p>Manage your openings, review candidates, and move great people forward.</p>
          </div>
          <Link className="hf-primary-btn" to="/recruiter/jobs">＋ Post a job</Link>
        </section>

        {error && <div className="hf-alert">{error}</div>}
        <section className="hf-stat-grid">
          <article className="hf-stat"><span>Posted jobs</span><strong>{loading ? '—' : jobs.length}</strong><small>Your active opportunities</small></article>
          <article className="hf-stat"><span>Total applications</span><strong>{loading ? '—' : applications.length}</strong><small>Across your posted jobs</small></article>
          <article className="hf-stat"><span>Shortlisted</span><strong>{loading ? '—' : count('shortlisted')}</strong><small>Ready for next steps</small></article>
          <article className="hf-stat"><span>Selected</span><strong>{loading ? '—' : count('hired')}</strong><small>Successful candidates</small></article>
        </section>

        <section className="hf-section-head">
          <div><span className="hf-eyebrow">QUICK ACCESS</span><h2>Your recruitment workspace</h2><p>Each area has its own page so your workflow stays organized.</p></div>
        </section>
        <section className="hf-action-grid">
          <Link to="/recruiter/jobs" className="hf-action-card">
            <span className="hf-action-icon">▤</span><h3>My Posted Jobs</h3>
            <p>Add new openings and review the jobs you have published.</p>
            <span className="hf-action-link">Manage jobs <b>→</b></span>
          </Link>
          <Link to="/recruiter/applicants" className="hf-action-card">
            <span className="hf-action-icon">♙</span><h3>Applicants & Interviews</h3>
            <p>Review candidate profiles, shortlist applicants and update interview rounds.</p>
            <span className="hf-action-link">Review applicants <b>→</b></span>
          </Link>
          <Link to="/jobs" className="hf-action-card">
            <span className="hf-action-icon">↗</span><h3>Candidate Job Board</h3>
            <p>Open the public job board preview. Recruiter accounts cannot apply to jobs.</p>
            <span className="hf-action-link">View job board <b>→</b></span>
          </Link>
        </section>

        <section className="hf-panel">
          <div className="hf-panel-head"><div><span className="hf-eyebrow">LATEST</span><h2>Recent applicants</h2></div><Link to="/recruiter/applicants">View all →</Link></div>
          {loading ? <p className="hf-muted">Loading recruiter data…</p> : applications.length === 0 ? <div className="hf-empty"><h3>No applications yet</h3><p>Once candidates apply to your jobs, they will appear here.</p></div> : (
            <div className="hf-table-wrap"><table className="hf-table"><thead><tr><th>Candidate</th><th>Position</th><th>Status</th><th>Interview rounds</th></tr></thead><tbody>
              {applications.slice(0, 5).map(a => <tr key={a.id}><td><strong>{a.candidate_name || 'Candidate'}</strong><small>Application #{a.id}</small></td><td>{a.job_title || (typeof a.job === 'object' ? a.job?.title : `Job #${a.job}`)}</td><td><span className={`hf-status hf-status-${(a.status || 'applied').toLowerCase()}`}>{(a.status || 'applied').replace('_', ' ')}</span></td><td>{a.interview_rounds ?? 0}</td></tr>)}
            </tbody></table></div>
          )}
        </section>
      </main>
    </div>
  )
}

export default RecruiterDashboard
