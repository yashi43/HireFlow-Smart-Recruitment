import '../styles/Navbar.css'
import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        Hire<span>Flow</span>
      </Link>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/jobs">Find Jobs</Link>
        <Link to="/login" className="login-btn">
          Login
        </Link>
        <Link to="/register" className="signup-btn">
          Sign Up
        </Link>
      </div>
    </nav>
  )
}

export default Navbar