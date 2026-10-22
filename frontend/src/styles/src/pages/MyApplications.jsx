import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import '../styles/MyApplications.css'

const API = 'http://127.0.0.1:8000/api'
const statusInfo = {
  applied: {label:'Application submitted', step:1},
  screening: {label:'Under review', step:2},
  shortlisted: {label:'You are shortlisted!', step:3},
  interview: {label:'Interview in progress', step:4},
  hired: {label:'Selected', step:5},
  rejected: {label:'Application not selected', step:0},
}
function getUser() { try { return JSON.parse(localStorage.getItem('user')) } catch { return null } }

export default function MyApplications() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const user = getUser()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) { setError('Please log in to view your applications.'); setLoading(false); return }
    if (user?.role === 'recruiter') { navigate('/recruiter'); return }
    fetch(`${API}/my-applications/`, {headers:{Authorization:`Token ${token}`}})
      .then(async res => {
        if (!res.ok) throw new Error(res.status === 401 || res.status === 403 ? 'Your session may have expired. Please log in again as a candidate.' : `Could not load applications (HTTP ${res.status}).`)
        const data = await res.json()
        setApplications(Array.isArray(data) ? data : data.results || [])
      })
      .catch(e => setError(e.message || 'Could not load applications.'))
      .finally(() => setLoading(false))
  }, [])

  return <div className="hf-myapps"><Navbar /><main className="hf-myapps-main">
    <div className="hf-myapps-hero"><div><span className="hf-eyebrow">APPLICATION TRACKING</span><h1>My <em>Applications</em></h1><p>Follow every application and see when your recruitment status changes.</p></div><Link to="/jobs" className="hf-primary-btn">Browse jobs →</Link></div>
    {error && <div className="hf-alert">{error} {error.includes('log in') && <Link to="/login">Log in</Link>}</div>}
    {loading && <div className="hf-panel hf-loading">Loading your applications…</div>}
    {!loading && !error && applications.length === 0 && <section className="hf-panel hf-empty"><div className="hf-empty-icon">▤</div><h2>No applications yet</h2><p>When you apply for a role, your application and its progress will appear here.</p><Link className="hf-primary-btn" to="/jobs">Explore open jobs</Link></section>}
    <section className="hf-myapps-list">
      {applications.map(a => {
        const status = (a.status || 'applied').toLowerCase()
        const info = statusInfo[status] || statusInfo.applied
        const title = a.job_title || (typeof a.job === 'object' ? a.job?.title : `Job #${a.job}`)
        const rounds = Number(a.interview_rounds || 0)
        return <article className="hf-application-card" key={a.id}>
          <div className="hf-app-card-top"><div className="hf-job-mark">{(title || 'J').charAt(0).toUpperCase()}</div><div className="hf-app-title"><h2>{title}</h2><p>{a.company || a.company_name || 'Company details'}</p><small>Application #{a.id}{a.applied_at ? ` · Applied ${new Date(a.applied_at).toLocaleDateString()}` : ''}</small></div><span className={`hf-status hf-status-${status}`}>{info.label}</span></div>
          {status === 'shortlisted' && <div className="hf-shortlist-note">🎉 Congratulations! Your application has been shortlisted. Check this page for interview progress updates.</div>}
          {status === 'rejected' ? <div className="hf-rejected-note">Thank you for applying. This application is no longer progressing.</div> : <div className="hf-timeline"><div className={`hf-timeline-step ${info.step >= 1 ? 'complete' : ''}`}><span>1</span><small>Applied</small></div><i className={info.step >= 2 ? 'complete' : ''}/><div className={`hf-timeline-step ${info.step >= 2 ? 'complete' : ''}`}><span>2</span><small>Review</small></div><i className={info.step >= 3 ? 'complete' : ''}/><div className={`hf-timeline-step ${info.step >= 3 ? 'complete' : ''}`}><span>3</span><small>Shortlisted</small></div><i className={info.step >= 4 ? 'complete' : ''}/><div className={`hf-timeline-step ${info.step >= 4 ? 'complete' : ''}`}><span>4</span><small>Interview</small></div><i className={info.step >= 5 ? 'complete' : ''}/><div className={`hf-timeline-step ${info.step >= 5 ? 'complete' : ''}`}><span>5</span><small>Decision</small></div></div>}
          {rounds > 0 && <div className="hf-interview-box"><div><strong>Interview progress</strong><p>{rounds} round{rounds === 1 ? '' : 's'} completed</p></div><div className="hf-round-pills">{Array.from({length:Math.min(rounds,8)},(_,i)=><span className="done" key={i}>Round {i+1} ✓</span>)}</div></div>}
          {a.resume && <div className="hf-app-extra">Resume: {typeof a.resume === 'string' ? a.resume.split('/').pop() : 'Uploaded'}</div>}
          {a.cover_letter && <details className="hf-cover"><summary>View cover letter</summary><p>{a.cover_letter}</p></details>}
        </article>
      })}
    </section>
  </main></div>
}
