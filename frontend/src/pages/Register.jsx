import { Link } from 'react-router-dom'
import '../styles/Auth.css'
function Register() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="logo">
          Hire<span>Flow</span>
        </Link>

        <h1>Create your account</h1>
        <p className="auth-subtitle">
          Join HireFlow and take the next step in your career.
        </p>

        <form className="auth-form">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            placeholder="Choose a username"
            required
          />

          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Create a password"
            required
          />

          <label htmlFor="role">I want to join as</label>
          <select id="role" className="auth-select" defaultValue="candidate">
            <option value="candidate">Candidate</option>
            <option value="recruiter">Recruiter</option>
          </select>

          <button type="submit" className="auth-submit">
            Create Account
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>

        <Link to="/" className="back-home">
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}

export default Register