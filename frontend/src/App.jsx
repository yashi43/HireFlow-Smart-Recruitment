
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Jobs from './pages/Jobs'
import RecruiterDashboard from './pages/RecruiterDashboard'
import ApplicationForm from './pages/ApplicationForm'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/apply/:jobId" element={<ApplicationForm />} />
        <Route path="/recruiter" element={<RecruiterDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
