import { Link } from 'react-router-dom'
import '../styles/Auth.css'

function Login() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="logo">
          Hire<span>Flow</span>
        </Link>

        <h1>Welcome back!</h1>
        <p className="auth-subtitle">
          Sign in to continue your journey with HireFlow.
        </p>

        <form className="auth-form">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            placeholder="Enter your username"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            required
          />

          <button type="submit" className="auth-submit">
            Sign In
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create account</Link>
        </p>

        <Link to="/" className="back-home">
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}

export default Login