import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/Jobs.css'

const sampleJobs = [
  {
    id: 1,
    title: 'Software Engineer',
    company: 'Capgemini',
    location: 'Pune, India',
    type: 'Full-time',
    experience: 'Fresher',
    salary: '₹7–10 LPA',
    skills: ['Java', 'Python', 'SQL'],
  },
  {
    id: 2,
    title: 'Frontend Developer',
    company: 'TechNova',
    location: 'Bengaluru, India',
    type: 'Full-time',
    experience: '0–2 years',
    salary: '₹5–8 LPA',
    skills: ['React', 'JavaScript', 'CSS'],
  },
  {
    id: 3,
    title: 'Python Developer',
    company: 'CloudBridge',
    location: 'Remote',
    type: 'Full-time',
    experience: 'Fresher',
    salary: '₹4–7 LPA',
    skills: ['Python', 'Django', 'MySQL'],
  },
  {
    id: 4,
    title: 'Data Analyst',
    company: 'InsightWorks',
    location: 'Mumbai, India',
    type: 'Full-time',
    experience: '0–2 years',
    salary: '₹4–6 LPA',
    skills: ['SQL', 'Excel', 'Python'],
  },
]

function Jobs() {
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('All locations')

  const filteredJobs = sampleJobs.filter((job) => {
    const matchesSearch =
      `${job.title} ${job.company} ${job.skills.join(' ')}`
        .toLowerCase()
        .includes(search.toLowerCase())

    const matchesLocation =
      location === 'All locations' || job.location === location

    return matchesSearch && matchesLocation
  })

  return (
    <div className="jobs-page">
      <header className="jobs-header">
        <Link to="/" className="logo">
          Hire<span>Flow</span>
        </Link>

        <nav>
          <Link to="/">Home</Link>
          <Link to="/login">Login</Link>
          <Link to="/register" className="signup-btn">
            Sign Up
          </Link>
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
            onChange={(event) => setSearch(event.target.value)}
          />

          <select
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          >
            <option>All locations</option>
            <option>Pune, India</option>
            <option>Bengaluru, India</option>
            <option>Mumbai, India</option>
            <option>Remote</option>
          </select>
        </div>
      </section>

      <main className="jobs-content">
        <div className="jobs-heading">
          <div>
            <h2>Explore opportunities</h2>
            <p>Find the role that matches your career goals.</p>
          </div>

          <span>{filteredJobs.length} jobs found</span>
        </div>

        <div className="jobs-grid">
          {filteredJobs.map((job) => (
            <article className="job-card" key={job.id}>
              <div className="job-card-top">
                <div className="company-avatar">
                  {job.company.charAt(0)}
                </div>

                <span className="job-type">{job.type}</span>
              </div>

              <h3>{job.title}</h3>
              <p className="job-company">{job.company}</p>

              <div className="job-meta">
                <span>📍 {job.location}</span>
                <span>💼 {job.experience}</span>
              </div>

              <div className="job-skills">
                {job.skills.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>

              <div className="job-card-bottom">
                <div>
                  <strong>{job.salary}</strong>
                  <p>Annual salary</p>
                </div>

                <Link
                  to={`/jobs/${job.id}`}
                  className="job-details-btn"
                  state={{ job }}
                >
                  View Details →
                </Link>
              </div>
            </article>
          ))}
        </div>

        {filteredJobs.length === 0 && (
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