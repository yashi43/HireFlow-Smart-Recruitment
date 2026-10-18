
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import '../styles/Navbar.css'

function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    try {
      const savedUser = JSON.parse(localStorage.getItem('user'))
      const token = localStorage.getItem('token')
      setUser(token && savedUser ? savedUser : null)
    } catch {
      setUser(null)
    }
  }, [location.pathname])

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/login')
  }

  const isRecruiter = user?.role === 'recruiter'

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        Hire<span>Flow</span>
      </Link>

      <div className="navbar-links">
        <Link to="/">Home</Link>

        {!isRecruiter && (
          <Link to="/jobs">Find Jobs</Link>
        )}

        {isRecruiter && (
          <Link to="/recruiter">Recruiter Dashboard</Link>
        )}
      </div>

      <div className="navbar-actions">
        {user ? (
          <>
            <span className="navbar-user">
              Hi, {user.username || 'User'}
            </span>
            <button type="button" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar
