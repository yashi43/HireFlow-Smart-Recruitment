import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import '../styles/Auth.css'

function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('candidate')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleRegister = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      await axios.post('http://127.0.0.1:8000/api/register/', {
        username,
        email,
        password,
        role,
      })

      navigate('/login')
    } catch (err) {
      const data = err.response?.data

      setError(
        typeof data === 'string'
          ? data
          : data
            ? Object.entries(data)
                .map(([key, value]) =>
                  `${key}: ${Array.isArray(value) ? value.join(', ') : value}`
                )
                .join(' | ')
            : 'Registration failed. Please check that the backend is running.'
      )

      console.error('Registration error:', data || err.message)
    } finally {
      setLoading(false)
    }
  }

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

        <form className="auth-form" onSubmit={handleRegister}>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            placeholder="Choose a username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />

          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <label htmlFor="role">I want to join as</label>
          <select
            id="role"
            className="auth-select"
            value={role}
            onChange={(event) => setRole(event.target.value)}
          >
            <option value="candidate">Candidate</option>
            <option value="recruiter">Recruiter</option>
          </select>

          {error && <p className="auth-error">{error}</p>}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
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