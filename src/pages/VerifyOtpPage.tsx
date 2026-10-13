import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api } from '@/api/client'

export default function VerifyOtpPage({ onSuccess }: { onSuccess: () => Promise<void> }) {
  const location = useLocation()
  const navigate = useNavigate()
  const email = (location.state as any)?.email || ''
  const devCode = (location.state as any)?.devCode || ''
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.verifyOtp(code)
      if (res.ok) {
        await onSuccess()
        navigate('/dashboard')
      } else {
        setError(res.error || 'Invalid code')
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body text-center">
          <h1 className="text-2xl font-bold">Verify your email</h1>
          <p className="text-base-content/60 text-sm mt-1 mb-4">
            We sent a 6-digit code to <strong>{email}</strong>
          </p>

          {error && <div className="alert alert-error text-sm mb-3" data-error>{error}</div>}

          {devCode && (
            <div className="alert alert-info text-sm mb-3" data-dev-code={devCode}>
              <span>Dev mode: code is <strong className="font-mono text-lg">{devCode}</strong></span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <input
                type="text" inputMode="numeric" pattern="\d{6}" maxLength={6}
                value={code} onChange={e => setCode(e.target.value)}
                className="input input-bordered w-full text-center text-2xl tracking-[0.5em] font-mono"
                placeholder="______" required autoFocus
              />
            </div>
            <button type="submit" className={`btn btn-primary w-full ${loading ? 'loading' : ''}`} disabled={loading}>
              {loading ? 'Verifying…' : 'Verify & Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
