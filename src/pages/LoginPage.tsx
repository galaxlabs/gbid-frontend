import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '@/api/client'

export default function LoginPage({ onSuccess }: { onSuccess: () => Promise<void> }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.login({ email, password })
      if (res.devCode) {
        // OTP step — redirect to verify with the dev code
        navigate('/verify-otp', { state: { email: res.email, devCode: res.devCode } })
      } else if (res.ok) {
        await onSuccess()
        navigate('/dashboard')
      } else {
        setError(res.error || 'Login failed')
      }
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="text-2xl font-bold text-center">Sign in</h1>
          <p className="text-base-content/60 text-sm text-center mb-4">Access your companies and GBID.</p>

          {error && <div className="alert alert-error text-sm"><span>{error}</span></div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Email</span></label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="input input-bordered w-full" required autoComplete="email" />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Password</span></label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="input input-bordered w-full" required autoComplete="current-password" />
            </div>
            <button type="submit" className={`btn btn-primary w-full ${loading ? 'loading' : ''}`} disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="divider text-xs text-base-content/40">or</div>
          <p className="text-sm text-base-content/60 text-center">
            New here? <Link to="/signup" className="link link-primary">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
