import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import '../styles/RecruiterJobs.css'

const API = 'http://127.0.0.1:8000/api'
const initialForm = { title: '', company: '', location: '', description: '', skills_required: '', salary: '', experience: '' }
function getUser() { try { return JSON.parse(localStorage.getItem('user')) } catch { return null } }

export default function RecruiterJobs() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const user = getUser()
  const [jobs, setJobs] = useState([])
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function loadJobs() {
    const res = await fetch(`${API}/jobs/mine/`, { headers: { Authorization: `Token ${token}` } })
    if (!res.ok) throw new Error(`Could not load your posted jobs (HTTP ${res.status}).`)
    const data = await res.json()
    setJobs(Array.isArray(data) ? data : data.results || [])
  }

  useEffect(() => {
    if (!token || user?.role !== 'recruiter') { navigate('/login'); return }
    loadJobs().catch(e => setError(e.message)).finally(() => setLoading(false))
  }, [])

  async function submit(e) {
    e.preventDefault(); setSaving(true); setError(''); setMessage('')
    try {
      const res = await fetch(`${API}/jobs/`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Token ${token}` }, body: JSON.stringify(form) })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(Object.values(data).flat().join(' ') || `Job posting failed (HTTP ${res.status}).`)
      setForm(initialForm); setMessage('Job posted successfully.'); await loadJobs()
    } catch (e) { setError(e.message || 'Could not post this job.') }
    finally { setSaving(false) }
  }

  return <div className="hf-recruiter"><Navbar /><main className="hf-rjobs">
    <div className="hf-page-top"><div><Link to="/recruiter" className="hf-back-link">← Dashboard</Link><span className="hf-eyebrow">RECRUITER WORKSPACE</span><h1>My posted jobs</h1><p>Create and manage openings published by your account.</p></div><Link className="hf-secondary-btn" to="/recruiter/applicants">Manage applicants →</Link></div>
    {error && <div className="hf-alert">{error}</div>}{message && <div className="hf-success">{message}</div>}
    <div className="hf-job-layout">
      <section className="hf-panel"><div className="hf-panel-head"><div><span className="hf-eyebrow">NEW OPPORTUNITY</span><h2>Post a job</h2><p>Fields marked * are required.</p></div></div>
        <form className="hf-job-form" onSubmit={submit}>
          <label>Job title *<input required name="title" value={form.title} onChange={e => setForm({...form, title:e.target.value})} placeholder="e.g. Software Engineer" /></label>
          <label>Company *<input required name="company" value={form.company} onChange={e => setForm({...form, company:e.target.value})} placeholder="Company name" /></label>
          <label>Location *<input required name="location" value={form.location} onChange={e => setForm({...form, location:e.target.value})} placeholder="Pune / Hybrid / Remote" /></label>
          <label>Required skills *<input required name="skills_required" value={form.skills_required} onChange={e => setForm({...form, skills_required:e.target.value})} placeholder="Python, SQL, React" /></label>
          <label>Salary<input name="salary" value={form.salary} onChange={e => setForm({...form, salary:e.target.value})} placeholder="e.g. 6 LPA" /></label>
          <label>Experience<input name="experience" value={form.experience} onChange={e => setForm({...form, experience:e.target.value})} placeholder="Fresher / 0–2 years" /></label>
          <label className="hf-form-wide">Job description *<textarea required rows="5" name="description" value={form.description} onChange={e => setForm({...form, description:e.target.value})} placeholder="Responsibilities, expectations and requirements…" /></label>
          <button className="hf-primary-btn hf-form-wide" disabled={saving}>{saving ? 'Publishing…' : '＋ Publish job'}</button>
        </form>
      </section>
      <section className="hf-panel"><div className="hf-panel-head"><div><span className="hf-eyebrow">YOUR OPENINGS</span><h2>Published jobs <span className="hf-count">{jobs.length}</span></h2></div></div>
        {loading ? <p className="hf-muted">Loading jobs…</p> : jobs.length === 0 ? <div className="hf-empty"><h3>No jobs posted yet</h3><p>Your published jobs will show here.</p></div> : <div className="hf-posted-list">{jobs.map(job => <article className="hf-posted-job" key={job.id}><div className="hf-job-mark">{(job.title || 'J').charAt(0).toUpperCase()}</div><div className="hf-posted-job-main"><h3>{job.title}</h3><p>{job.company} · {job.location}</p><div className="hf-tags">{(job.skills_required || '').split(/[,;]/).filter(Boolean).slice(0,5).map(skill => <span key={skill}>{skill.trim()}</span>)}</div>{job.salary && <small>Salary: {job.salary}</small>}<p className="hf-job-desc">{job.description}</p></div><span className="hf-job-id">Job #{job.id}</span></article>)}</div>}
      </section>
    </div>
  </main></div>
}
