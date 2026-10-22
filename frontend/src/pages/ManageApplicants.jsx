import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import '../styles/ManageApplicants.css'

const API = 'http://127.0.0.1:8000/api'
const statuses = [
  ['applied', 'Applied'], ['screening', 'Screening'], ['shortlisted', 'Shortlisted'],
  ['interview', 'Interview'], ['hired', 'Selected'], ['rejected', 'Rejected'],
]
function getUser() { try { return JSON.parse(localStorage.getItem('user')) } catch { return null } }

export default function ManageApplicants() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const user = getUser()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [savingId, setSavingId] = useState(null)
  const [filter, setFilter] = useState('all')

  async function load() {
    const res = await fetch(`${API}/recruiter-applications/`, { headers: { Authorization: `Token ${token}` } })
    if (!res.ok) throw new Error(`Could not load applicants (HTTP ${res.status}).`)
    const data = await res.json()
    setApplications(Array.isArray(data) ? data : data.results || [])
  }
  useEffect(() => {
    if (!token || user?.role !== 'recruiter') { navigate('/login'); return }
    load().catch(e => setError(e.message)).finally(() => setLoading(false))
  }, [])

  async function update(id, patch) {
    const current = applications.find(a => a.id === id)
    if (!current) return
    const status = patch.status ?? current.status ?? 'applied'
    const interview_rounds = Number(patch.interview_rounds ?? current.interview_rounds ?? 0)
    if (!Number.isInteger(interview_rounds) || interview_rounds < 0) { setError('Interview rounds must be a whole number, 0 or more.'); return }
    setSavingId(id); setError(''); setNotice('')
    try {
      const res = await fetch(`${API}/applications/${id}/status/`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Token ${token}` }, body: JSON.stringify({ status, interview_rounds }) })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(Object.values(data).flat().join(' ') || `Status update failed (HTTP ${res.status}).`)
      setApplications(prev => prev.map(a => a.id === id ? {...a, status, interview_rounds} : a))
      setNotice(`Application #${id} updated. Candidate will see the saved status on My Applications.`)
    } catch (e) { setError(e.message); await load().catch(() => {}) }
    finally { setSavingId(null) }
  }

  const filtered = filter === 'all' ? applications : applications.filter(a => (a.status || 'applied').toLowerCase() === filter)
  const count = status => applications.filter(a => (a.status || 'applied').toLowerCase() === status).length

  return <div className="hf-recruiter"><Navbar /><main className="hf-applicants">
    <div className="hf-page-top"><div><Link to="/recruiter" className="hf-back-link">← Dashboard</Link><span className="hf-eyebrow">CANDIDATE PIPELINE</span><h1>Applicants & interviews</h1><p>Update a candidate's status and interview rounds. Changes are saved to the backend.</p></div><Link className="hf-secondary-btn" to="/recruiter/jobs">Manage jobs →</Link></div>
    {error && <div className="hf-alert">{error}</div>}{notice && <div className="hf-success">{notice}</div>}
    <section className="hf-stat-grid hf-small-stats">
      <article className="hf-stat"><span>All applicants</span><strong>{applications.length}</strong></article>
      <article className="hf-stat"><span>Shortlisted</span><strong>{count('shortlisted')}</strong></article>
      <article className="hf-stat"><span>Interview</span><strong>{count('interview')}</strong></article>
      <article className="hf-stat"><span>Selected</span><strong>{count('hired')}</strong></article>
    </section>
    <section className="hf-panel"><div className="hf-panel-head hf-filter-head"><div><span className="hf-eyebrow">REVIEW & DECIDE</span><h2>Candidate applications</h2></div><label className="hf-filter-label">Filter <select value={filter} onChange={e => setFilter(e.target.value)}><option value="all">All statuses</option>{statuses.map(([value,label]) => <option value={value} key={value}>{label}</option>)}</select></label></div>
      {loading ? <p className="hf-muted">Loading applications…</p> : filtered.length === 0 ? <div className="hf-empty"><h3>No applicants in this view</h3><p>Try another status filter or wait for applications to arrive.</p></div> : <div className="hf-candidate-list">{filtered.map(a => <article className="hf-candidate-card" key={a.id}>
        <div className="hf-candidate-top"><div className="hf-avatar">{(a.candidate_name || 'C').charAt(0).toUpperCase()}</div><div className="hf-candidate-info"><h3>{a.candidate_name || 'Candidate'}</h3><p>{a.candidate_email || a.email || 'Candidate application'}</p><small>Application #{a.id} · {a.job_title || (typeof a.job === 'object' ? a.job?.title : `Job #${a.job}`)}</small></div><span className={`hf-status hf-status-${(a.status || 'applied').toLowerCase()}`}>{(a.status || 'applied').replace('_',' ')}</span></div>
        <div className="hf-candidate-details">{a.phone && <span><b>Phone</b>{a.phone}</span>}{a.linkedin_url && <a href={a.linkedin_url} target="_blank" rel="noreferrer">LinkedIn profile ↗</a>}{a.github_url && <a href={a.github_url} target="_blank" rel="noreferrer">GitHub profile ↗</a>}{a.resume && <a href={a.resume.startsWith('http') ? a.resume : `http://127.0.0.1:8000${a.resume}`} target="_blank" rel="noreferrer">View resume ↗</a>}</div>
        {a.cover_letter && <details className="hf-cover"><summary>Read cover letter</summary><p>{a.cover_letter}</p></details>}
        <div className="hf-review-controls"><label>Application status<select value={a.status || 'applied'} disabled={savingId === a.id} onChange={e => update(a.id, {status:e.target.value})}>{statuses.map(([value,label]) => <option value={value} key={value}>{label}</option>)}</select></label><label>Interview rounds completed<input type="number" min="0" step="1" value={a.interview_rounds ?? 0} disabled={savingId === a.id} onChange={e => {const val = e.target.value; setApplications(prev => prev.map(item => item.id === a.id ? {...item, interview_rounds: val === '' ? '' : Number(val)} : item))}} onBlur={e => {const n = Number(e.target.value); if (Number.isInteger(n) && n >= 0) update(a.id, {interview_rounds:n}); else load().catch(() => {})}} /></label>{savingId === a.id && <span className="hf-saving">Saving…</span>}</div>
        <div className="hf-round-progress"><span>Interview progress</span><div className="hf-round-pills">{Array.from({length: Math.min(Number(a.interview_rounds || 0), 8)}, (_, i) => <span className="done" key={i}>Round {i+1} ✓</span>)}{Number(a.interview_rounds || 0) === 0 && <small>No interview rounds recorded yet</small>}</div></div>
      </article>)}</div>}
    </section>
  </main></div>
}
