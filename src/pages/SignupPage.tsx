import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '@/api/client'

export default function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== password2) { setError('Passwords do not match'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      const res = await api.signup({ email, password, password2, full_name: fullName })
      if (res.ok) {
        navigate('/login', { state: { email: res.email } })
      } else {
        setError(res.error || 'Signup failed')
      }
    } catch (err: any) {
      setError(err.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="text-2xl font-bold text-center">Create your account</h1>
          <p className="text-base-content/60 text-sm text-center mb-4">Register once, then sign in to manage your GBID businesses.</p>

          {error && <div className="alert alert-error text-sm" data-error>{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Full Name</span></label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                className="input input-bordered w-full" autoComplete="name" />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Email</span></label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="input input-bordered w-full" required autoComplete="email" />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Password</span></label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="input input-bordered w-full" required minLength={8} autoComplete="new-password" />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Confirm Password</span></label>
              <input type="password" value={password2} onChange={e => setPassword2(e.target.value)}
                className="input input-bordered w-full" required minLength={8} autoComplete="new-password" />
            </div>
            <button type="submit" className={`btn btn-primary w-full ${loading ? 'loading' : ''}`} disabled={loading}>
              {loading ? 'Creating…' : 'Create Account'}
            </button>
          </form>
          <p className="text-sm text-base-content/60 text-center mt-4">
            Already have an account? <Link to="/login" className="link link-primary">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
