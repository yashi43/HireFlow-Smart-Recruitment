import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import '../styles/Auth.css'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleLogin = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/login/',
        { username, password }
      )

      const data = response.data

      if (data.token) {
        localStorage.setItem('token', data.token)
      }

      localStorage.setItem(
  'user',
  JSON.stringify({
    username: data.username,
    email: data.email,
    role: data.role,
  })
)

      navigate('/jobs')
    } catch (err) {
      const data = err.response?.data

setError(
  typeof data === 'string'
    ? data
    : data
      ? Object.values(data)
          .flat()
          .join(' ')
      : 'Unable to connect to the server. Please try again.'
)
      console.error('Login error:', err.response?.data || err.message)
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

        <h1>Welcome back!</h1>
        <p className="auth-subtitle">
          Sign in to continue your journey with HireFlow.
        </p>

        <form className="auth-form" onSubmit={handleLogin}>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          {error && <p className="auth-error">{error}</p>}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
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