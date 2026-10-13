import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/client'

export default function PublicProfilePage() {
  const { code } = useParams<{ code: string }>()
  const { data, isLoading, error } = useQuery({
    queryKey: ['publicBusiness', code],
    queryFn: () => api.getPublicBusiness(code!),
    enabled: !!code,
  })

  if (isLoading) return <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg text-primary"></span></div>
  if (error || !data?.business) return <div className="alert alert-warning max-w-2xl mx-auto">Public business profile not found.</div>

  const business = data.business

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <section className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-widest text-primary font-semibold">Verified Business Identity</p>
              <h1 className="text-3xl font-bold mt-2">{business.display_name || business.legal_name}</h1>
              <p className="text-base-content/60 mt-1">{business.legal_name}</p>
            </div>
            <span className="badge badge-neutral badge-outline font-mono text-sm p-4">{business.gbid_business_id}</span>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 mt-6">
            <div className="stat bg-base-200 rounded-box"><div className="stat-title">Country</div><div className="stat-value text-lg">{business.country}</div></div>
            <div className="stat bg-base-200 rounded-box"><div className="stat-title">Status</div><div className="stat-value text-lg">{business.status}</div></div>
            <div className="stat bg-base-200 rounded-box"><div className="stat-title">Verification</div><div className="stat-value text-lg">{business.verification_status || 'Unverified'}</div></div>
          </div>

          {business.description && <p className="mt-6 text-base-content/70 leading-7">{business.description}</p>}
        </div>
      </section>

      <section className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <h2 className="card-title">Identifiers</h2>
          <div className="divide-y divide-base-200">
            {business.identifiers?.map(identifier => (
              <div key={identifier.name} className="py-3 flex items-center justify-between gap-4">
                <span className="font-medium">{identifier.identifier_type}</span>
                <span className="font-mono text-sm">{identifier.identifier_value}</span>
              </div>
            ))}
            {!business.identifiers?.length && <p className="text-base-content/50 py-3">No public identifiers yet.</p>}
          </div>
        </div>
      </section>
    </div>
  )
}
