
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import '../styles/Home.css'

function Home() {
  return (
    <div className="hf-home">
      <Navbar />

      {/* HERO */}
      <main>
        <section className="hf-hero">
          <div className="hf-hero-inner">
            <div className="hf-hero-copy">
              <div className="hf-eyebrow">
                <span className="hf-eyebrow-dot" />
                SMART RECRUITMENT PLATFORM
              </div>

              <h1>
                Find the right talent.
                <br />
                <span>Build your future.</span>
              </h1>

              <p className="hf-hero-description">
                HireFlow connects talented candidates with exciting
                opportunities and helps recruiters hire smarter,
                faster, and better.
              </p>

              <div className="hf-hero-actions">
                <Link to="/jobs" className="hf-button hf-button-primary">
                  Explore Jobs <span>↗</span>
                </Link>

                <Link to="/register" className="hf-button hf-button-outline">
                  Get Started <span>→</span>
                </Link>
              </div>

              <div className="hf-trust">
                <div className="hf-avatars" aria-hidden="true">
                  <span>A</span>
                  <span>R</span>
                  <span>S</span>
                  <span>+</span>
                </div>
                <div>
                  <strong>Find your next opportunity</strong>
                  <p>One platform. Endless possibilities.</p>
                </div>
              </div>
            </div>

            {/* RECRUITMENT DASHBOARD VISUAL */}
            <div className="hf-visual">
              <div className="hf-glow" />

              <div className="hf-dashboard">
                <div className="hf-dashboard-header">
                  <div className="hf-brand">
                    <div className="hf-logo">HF</div>
                    <div>
                      <strong>HireFlow</strong>
                      <span>Hiring dashboard</span>
                    </div>
                  </div>
                  <span className="hf-live">
                    <i /> Live
                  </span>
                </div>

                <div className="hf-dashboard-content">
                  <p className="hf-dashboard-eyebrow">
                    YOUR NEXT CHAPTER STARTS HERE
                  </p>

                  <h2>
                    Great people.
                    <br />
                    Great opportunities.
                  </h2>

                  <p className="hf-dashboard-description">
                    Make your next career move count.
                  </p>

                  <div className="hf-stats">
                    <div className="hf-stat-card">
                      <span className="hf-stat-icon blue">↗</span>
                      <strong>2,480+</strong>
                      <span>Job opportunities</span>
                    </div>

                    <div className="hf-stat-card">
                      <span className="hf-stat-icon purple">✦</span>
                      <strong>86%</strong>
                      <span>Match accuracy</span>
                    </div>
                  </div>

                  <div className="hf-dashboard-bottom">
                    <span className="hf-check">✓</span>
                    <div>
                      <strong>Your next opportunity awaits</strong>
                      <span>Explore roles that fit your skills</span>
                    </div>
                    <span className="hf-arrow">↗</span>
                  </div>
                </div>
              </div>

              <div className="hf-floating hf-floating-top">
                <span className="hf-floating-icon">✦</span>
                <div>
                  <strong>Smart Matching</strong>
                  <span>Find your perfect fit</span>
                </div>
              </div>

              <div className="hf-floating hf-floating-bottom">
                <span className="hf-floating-icon success">✓</span>
                <div>
                  <strong>Better connections</strong>
                  <span>Careers meet opportunities</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="hf-features">
          <div className="hf-section-heading">
            <span>WHY HIREFLOW?</span>
            <h2>A smarter way to move forward.</h2>
            <p>
              Everything you need to discover opportunities and make
              better hiring decisions.
            </p>
          </div>

          <div className="hf-feature-grid">
            <article className="hf-feature-card">
              <div className="hf-feature-icon blue">⌕</div>
              <h3>Find Opportunities</h3>
              <p>
                Discover job openings that match your skills,
                interests, and career goals.
              </p>
              <Link to="/jobs">Explore jobs <span>→</span></Link>
            </article>

            <article className="hf-feature-card">
              <div className="hf-feature-icon purple">✦</div>
              <h3>Smart Matching</h3>
              <p>
                Understand how your skills align with the requirements
                of a role.
              </p>
              <Link to="/jobs">Find your fit <span>→</span></Link>
            </article>

            <article className="hf-feature-card">
              <div className="hf-feature-icon green">✓</div>
              <h3>Easy Hiring</h3>
              <p>
                Help recruiters manage job postings and candidate
                applications in one place.
              </p>
              <Link to="/recruiter">Recruiter portal <span>→</span></Link>
            </article>
          </div>
        </section>

        {/* CALL TO ACTION */}
        <section className="hf-cta">
          <div>
            <span className="hf-cta-label">YOUR FUTURE STARTS NOW</span>
            <h2>Ready to take the next step?</h2>
            <p>Discover opportunities and move your career forward.</p>
          </div>

          <Link to="/jobs" className="hf-button hf-button-primary">
            Browse Jobs <span>→</span>
          </Link>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="hf-footer">
        <Link to="/" className="hf-footer-brand">
          <span className="hf-footer-logo">HF</span>
          <span>Hire<span className="hf-footer-accent">Flow</span></span>
        </Link>

        <p>Connecting talent with opportunity.</p>

        <span className="hf-copyright">© 2026 HireFlow</span>
      </footer>
    </div>
  )
}

export default Home
