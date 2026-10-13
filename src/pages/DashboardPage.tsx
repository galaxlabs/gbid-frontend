import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/api/client'
import type { Business, User } from '@/types'

export default function DashboardPage({ user }: { user: User | null }) {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    api.getMyBusinesses()
      .then(data => setBusinesses(data.businesses || []))
      .catch(() => setLoading(false))
      .finally(() => setLoading(false))
  }, [user])

  if (!user) return (
    <div className="text-center py-12">
      <h2 className="text-xl font-semibold mb-4">Sign in to view your companies</h2>
      <Link to="/login" className="btn btn-primary">Sign in</Link>
    </div>
  )

  if (loading) return <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg text-primary"></span></div>

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Companies</h1>
          <p className="text-base-content/60 mt-1">Manage your registered businesses.</p>
        </div>
        <Link to="/countries" className="btn btn-primary">Register a Company</Link>
      </div>

      {businesses.length === 0 ? (
        <div className="card bg-base-100 shadow-sm text-center py-12">
          <h2 className="text-xl font-semibold">No companies yet</h2>
          <p className="text-base-content/60 mt-1 mb-6">Register your first company to get a GBID.</p>
          <Link to="/countries" className="btn btn-primary mx-auto">Register a Company</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {businesses.map(b => (
            <div key={b.name} className="card bg-base-100 shadow-sm border border-base-200">
              <div className="card-body flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="card-title text-lg">{b.legal_name}</h2>
                    {b.display_name && b.display_name !== b.legal_name && <span className="text-base-content/60">{b.display_name}</span>}
                    <span className="badge badge-neutral badge-outline font-mono">{b.gbid_business_id}</span>
                    <span className={`badge ${b.public_profile ? 'badge-success' : 'badge-ghost'}`}>
                      {b.public_profile ? 'Public' : 'Private'}
                    </span>
                    <span className="badge badge-warning badge-sm">{b.status}</span>
                  </div>
                  <p className="text-sm text-base-content/50 mt-1">{b.country}</p>
                </div>
                <div className="flex gap-2">
                  <Link to={`/public/${b.slug || b.gbid_business_id}`} className="btn btn-sm btn-ghost">View</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
