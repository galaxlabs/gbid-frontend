import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/client'
import type { Country, FieldDefinition, RegionNode, User } from '@/types'

export default function RegisterPage({ user }: { user: User | null }) {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { data: country, isLoading } = useQuery({
    queryKey: ['countryConfig', code],
    queryFn: () => api.getCountryConfig(code!.toUpperCase()),
    enabled: !!code,
  })

  const sections = useMemo(() => {
    if (!country?.schema?.fields) return {} as Record<string, FieldDefinition[]>
    const grouped: Record<string, FieldDefinition[]> = {}
    country.schema.fields.forEach(f => {
      ;(grouped[f.section] ??= []).push(f)
    })
    return grouped
  }, [country])

  const regionFields = useMemo(() => {
    if (!country?.schema?.fields) return [] as string[]
    return country.schema.fields
      .filter(f => f.field_type.toLowerCase() === 'select' && ['province', 'division', 'district', 'tehsil', 'union_council'].includes(f.field_key))
      .map(f => f.field_key)
  }, [country])

  const regionNodes = useMemo(() => {
    if (!country?.regions) return [] as RegionNode[]
    return country.regions
  }, [country])

  const getChildren = (parentCode: string, level: number): RegionNode[] => {
    function find(nodes: RegionNode[], depth: number): RegionNode[] {
      if (depth === level) return nodes.filter(n => n.code === parentCode)
      for (const n of nodes) {
        const found = find(n.children || [], depth)
        if (found.length) return found[0].children || []
      }
      return []
    }
    return find(regionNodes, 0)
  }

  const getRegionsAtLevel = (fieldKey: string): RegionNode[] => {
    const levelIndex = regionFields.indexOf(fieldKey)
    if (levelIndex < 0) return []
    if (levelIndex === 0) return regionNodes
    const parentField = regionFields[levelIndex - 1]
    const parentValue = formData[parentField]
    if (!parentValue) return []
    return getChildren(parentValue, levelIndex - 1)
  }

  const setField = (key: string, value: string) => {
    setFormData(prev => {
      const next = { ...prev, [key]: value }
      // Clear dependent region fields on parent change
      const idx = regionFields.indexOf(key)
      if (idx >= 0) {
        regionFields.slice(idx + 1).forEach(k => delete next[k])
      }
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!user) {
      navigate('/login')
      return
    }
    setLoading(true)
    try {
      await api.createBusiness({
        legal_name: formData.legal_name || formData.display_name || '',
        display_name: formData.display_name || formData.legal_name || '',
        country_code: code!.toUpperCase(),
        website: formData.website || '',
        email: formData.email || '',
        phone: formData.phone || '',
        description: formData.description || '',
        profile_json: JSON.stringify(formData),
      })
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) return <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg text-primary"></span></div>
  if (!country) return <div className="alert alert-warning">Country not found.</div>

  const isRtl = ['ar', 'ur', 'fa', 'ps'].includes(country.default_language)

  return (
    <div className="max-w-5xl mx-auto">
      <nav className="text-sm breadcrumbs mb-6">
        <ul><li><a href="/countries" className="link link-hover">Countries</a></li><li>{country.name}</li><li className="text-base-content/60">Register Company</li></ul>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Register in <span className="text-primary">{country.flag_emoji} {country.name}</span>
        </h1>
        <p className="text-base-content/60 mt-1">
          Schema v{country.schema?.version} · {country.languages?.map(l => l.code).join(', ')}
        </p>
      </div>

      {error && <div className="alert alert-error mb-6">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
        {Object.entries(sections).map(([section, fields], sIdx) => (
          <fieldset key={section} className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
            <div className="px-6 py-3 bg-gradient-to-r from-primary/10 via-secondary/5 to-transparent border-b border-base-200 flex items-center gap-3">
              <span className="badge badge-primary badge-lg font-bold">{sIdx + 1}</span>
              <span className="text-lg font-semibold capitalize">{section}</span>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                {fields.map(field => {
                  const isTextarea = field.field_type.toLowerCase() === 'textarea' || field.field_type.toLowerCase() === 'file'
                  const isRegion = regionFields.includes(field.field_key)
                  const regionOptions = isRegion ? getRegionsAtLevel(field.field_key) : []

                  return (
                    <div key={field.field_key}
                      className={`flex flex-col ${isTextarea ? 'md:col-span-2' : ''}`}>
                      <label className="label pb-1 min-h-8" htmlFor={field.field_key}>
                        <span className="flex w-full items-center justify-between gap-3" dir="ltr">
                          <span className="label-text font-medium text-sm">
                            {field.label_en}
                            {field.required && <span className="text-error font-bold">*</span>}
                          </span>
                          {field.label_local && (
                            <span className="label-text text-sm text-base-content/60 whitespace-nowrap" dir="rtl">
                              {field.label_local}
                            </span>
                          )}
                        </span>
                      </label>

                      {isRegion ? (
                        <select
                          id={field.field_key}
                          value={formData[field.field_key] || ''}
                          onChange={e => setField(field.field_key, e.target.value)}
                          className="select select-bordered bg-base-100 w-full"
                          required={field.required}
                          disabled={regionOptions.length === 0 && regionFields.indexOf(field.field_key) > 0}
                        >
                          <option value="" disabled>Select…</option>
                          {regionOptions.map(r => (
                            <option key={r.code} value={r.code}>
                              {r.local_name && r.local_name !== r.name_en
                                ? `${r.name_en} · ${r.local_name}`
                                : r.name_en}
                            </option>
                          ))}
                        </select>
                      ) : field.field_type.toLowerCase() === 'select' ? (
                        <select
                          id={field.field_key}
                          value={formData[field.field_key] || ''}
                          onChange={e => setField(field.field_key, e.target.value)}
                          className="select select-bordered bg-base-100 w-full"
                          required={field.required}
                        >
                          <option value="" disabled>Select…</option>
                          {field.choices_json?.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      ) : field.field_type.toLowerCase() === 'textarea' ? (
                        <textarea
                          id={field.field_key}
                          value={formData[field.field_key] || ''}
                          onChange={e => setField(field.field_key, e.target.value)}
                          className="textarea textarea-bordered bg-base-100 h-24 resize-y w-full"
                          placeholder={field.help_text_en}
                          required={field.required}
                          maxLength={field.max_length || undefined}
                        />
                      ) : field.field_type.toLowerCase() === 'file' ? (
                        <input type="file" id={field.field_key}
                          className="file-input file-input-bordered bg-base-100 w-full"
                          required={field.required} />
                      ) : (
                        <input
                          type={
                            field.field_type === 'email' ? 'email' :
                            field.field_type === 'url' ? 'url' :
                            field.field_type === 'phone' ? 'tel' :
                            field.field_type === 'number' ? 'number' : 'text'
                          }
                          id={field.field_key}
                          value={formData[field.field_key] || ''}
                          onChange={e => setField(field.field_key, e.target.value)}
                          className="input input-bordered bg-base-100 w-full"
                          placeholder={field.help_text_en}
                          required={field.required}
                          pattern={field.validation_regex || undefined}
                          minLength={field.min_length || undefined}
                          maxLength={field.max_length || undefined}
                        />
                      )}

                      {field.help_text_en && (
                        <div className="label pt-1">
                          <span className="label-text-alt text-base-content/50">{field.help_text_en}</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </fieldset>
        ))}

        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-base-content/60">
              <span className="text-error font-semibold">*</span> Required fields
            </p>
            <div className="flex gap-3 w-full sm:w-auto">
              <button type="button" className="btn btn-ghost btn-lg flex-1 sm:flex-none"
                onClick={() => setFormData({})}>Reset</button>
              <button type="submit"
                className={`btn btn-primary btn-lg flex-1 sm:flex-none px-10 shadow-lg shadow-primary/30 ${loading ? 'loading' : ''}`}
                disabled={loading}>
                {loading ? 'Registering…' : 'Register Company'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
