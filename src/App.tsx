import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/api/client'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import SignupPage from '@/pages/SignupPage'
import VerifyOtpPage from '@/pages/VerifyOtpPage'
import CountriesPage from '@/pages/CountriesPage'
import RegisterPage from '@/pages/RegisterPage'
import DashboardPage from '@/pages/DashboardPage'
import PublicProfilePage from '@/pages/PublicProfilePage'

export default function App() {
  const { user, loading, refresh, setUser } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await api.logout()
    setUser(null)
    navigate('/')
  }

  if (loading) return <div className="flex justify-center items-center min-h-screen"><span className="loading loading-spinner loading-lg text-primary"></span></div>

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="navbar bg-base-100 shadow-sm sticky top-0 z-50">
        <div className="navbar-start">
          <Link to="/" className="btn btn-ghost text-xl font-bold tracking-tight">GBID</Link>
        </div>
        <div className="navbar-end gap-2">
          {user ? (
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost">{user.email}</div>
              <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box w-52 p-2 shadow-sm z-50">
                <li><Link to="/dashboard">My Companies</Link></li>
                <li><Link to="/countries">Register New</Link></li>
                <li><button onClick={handleLogout}>Logout</button></li>
              </ul>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Sign in</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Sign up</Link>
            </>
          )}
        </div>
      </nav>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage onSuccess={refresh} />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage onSuccess={refresh} />} />
          <Route path="/countries" element={<CountriesPage />} />
          <Route path="/register/:code" element={<RegisterPage user={user} />} />
          <Route path="/dashboard" element={<DashboardPage user={user} />} />
          <Route path="/public/:code" element={<PublicProfilePage />} />
        </Routes>
      </main>

      <footer className="footer footer-center p-4 bg-base-200 text-base-content/50 text-sm">
        <p>Global Business Identity © 2026</p>
      </footer>
    </div>
  )
}
