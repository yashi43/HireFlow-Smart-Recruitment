import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import './App.css'

function Home() {
  return (
    <>
      <Navbar />

      <main className="home">
        <section className="hero-section">
          <div className="hero-content">
            <p className="hero-tag">SMART RECRUITMENT PLATFORM</p>
            <h1>
              Find the right talent.
              <br />
              <span>Build your future.</span>
            </h1>
            <p className="hero-text">
              HireFlow connects talented candidates with great
              opportunities and helps recruiters hire smarter.
            </p>
            <div className="hero-buttons">
              <a href="/jobs" className="primary-btn">Find Jobs</a>
              <a href="/register" className="secondary-btn">Get Started</a>
            </div>
          </div>

          <div className="hero-card">
            <div className="card-header">
              <span>Hiring Overview</span>
              <span className="live">● Live</span>
            </div>
            <div className="stat-main">
              <h2>2,480+</h2>
              <p>Active Opportunities</p>
            </div>
            <div className="mini-stats">
              <div>
                <strong>86%</strong>
                <span>Match Rate</span>
              </div>
              <div>
                <strong>1.2K+</strong>
                <span>Companies</span>
              </div>
            </div>
          </div>
        </section>

        <section className="features">
          <div className="feature">
            <div className="feature-icon">⌕</div>
            <h3>Find Opportunities</h3>
            <p>Discover jobs that match your skills and career goals.</p>
          </div>
          <div className="feature">
            <div className="feature-icon">✓</div>
            <h3>Smart Matching</h3>
            <p>See how your resume matches a job's required skills.</p>
          </div>
          <div className="feature">
            <div className="feature-icon">▣</div>
            <h3>Easy Hiring</h3>
            <p>Recruiters can manage jobs and candidate applications.</p>
          </div>
        </section>
      </main>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App