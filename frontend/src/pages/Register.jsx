
import { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import '../styles/Auth.css'

function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('candidate')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const passwordRules = [
    { label: 'At least 8 characters', valid: password.length >= 8 },
    { label: 'One uppercase letter (A–Z)', valid: /[A-Z]/.test(password) },
    { label: 'One lowercase letter (a–z)', valid: /[a-z]/.test(password) },
    { label: 'One number (0–9)', valid: /\d/.test(password) },
    {
      label: 'One special character (!@#$...)',
      valid: /[^A-Za-z0-9]/.test(password),
    },
  ]

  const isPasswordValid = passwordRules.every((rule) => rule.valid)

  const handleRegister = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (username.trim().length === 0) {
      setError('Please enter a username.')
      return
    }

    if (!isPasswordValid) {
      setError('Please fulfil all password requirements.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      await axios.post('http://127.0.0.1:8000/api/register/', {
        username: username.trim(),
        email: email.trim(),
        password,
        role,
      })

      setSuccess(
        'Account created successfully! You can now sign in with your credentials.'
      )
      setUsername('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setRole('candidate')
    } catch (err) {
      const data = err.response?.data

      if (!err.response) {
        setError('Cannot connect to the server. Please check that the backend is running.')
      } else if (typeof data === 'string') {
        setError(data)
      } else if (data && typeof data === 'object') {
        const messages = Object.entries(data).map(([key, value]) => {
          const details = Array.isArray(value)
            ? value.join(', ')
            : typeof value === 'object'
              ? JSON.stringify(value)
              : String(value)

          return `${key}: ${details}`
        })

        setError(messages.join(' | ') || 'Registration failed. Please try again.')
      } else {
        setError('Registration failed. Please try again.')
      }

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
            autoComplete="username"
            required
          />

          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Create a strong password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            required
          />

          <div className="password-rules">
            <p>Password requirements:</p>
            {passwordRules.map((rule) => (
              <p
                key={rule.label}
                style={{
                  color: rule.valid ? 'green' : '#777',
                  margin: '4px 0',
                  fontSize: '13px',
                }}
              >
                {rule.valid ? '✓' : '○'} {rule.label}
              </p>
            ))}
          </div>

          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Enter your password again"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            required
          />

          {confirmPassword && (
            <p
              style={{
                color: password === confirmPassword ? 'green' : 'crimson',
                fontSize: '13px',
                margin: '4px 0',
              }}
            >
              {password === confirmPassword
                ? '✓ Passwords match'
                : 'Passwords do not match'}
            </p>
          )}

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

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          {success && (
            <div role="status" style={{ marginTop: '12px', color: 'green' }}>
              <p>{success}</p>
              <Link to="/login">Go to Login →</Link>
            </div>
          )}

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
