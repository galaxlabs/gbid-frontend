import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { api } from '@/api/client'

export default function CountriesPage() {
  const { data: countries, isLoading } = useQuery({
    queryKey: ['countries'],
    queryFn: api.listCountries,
  })

  if (isLoading) return <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg text-primary"></span></div>

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Register your company</h1>
        <p className="text-base-content/60 mt-2 max-w-2xl mx-auto">
          Choose a country — the form, languages, address format, documents and ID patterns
          all load from that country's configuration. Nothing is global.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {countries?.map(c => (
          <Link key={c.code} to={`/register/${c.code}`}
            className="card bg-base-100 shadow-sm hover:shadow-lg hover:border-primary/40 transition-all border border-base-200">
            <div className="card-body">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="card-title text-lg">
                    {c.flag_emoji && <span className="text-2xl">{c.flag_emoji}</span>}
                    {c.name}
                    <span className="badge badge-outline font-mono">{c.code}</span>
                  </h2>
                  {c.local_name && <p className="text-base-content/60" dir={c.default_language === 'ar' || c.default_language === 'ur' ? 'rtl' : 'ltr'}>{c.local_name}</p>}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-3 text-xs">
                <span className="badge badge-ghost badge-sm gap-1">
                  {c.languages?.map(l => l.code).join(', ')}
                </span>
                {c.currency_code && <span className="badge badge-ghost badge-sm">{c.currency_code}</span>}
                {c.phone_country_code && <span className="badge badge-ghost badge-sm" dir="ltr">{c.phone_country_code}</span>}
                <span className="badge badge-ghost badge-sm">{c.date_format}</span>
              </div>

              <div className="card-actions justify-end mt-4">
                <span className="btn btn-sm btn-primary">Register →</span>
              </div>
            </div>
          </Link>
        ))}
        {countries?.length === 0 && <div className="alert col-span-full">No supported countries yet.</div>}
      </div>
    </div>
  )
}
