import type { Business, Country, CountrySchemaResponse, HealthResponse, User } from '@/types'

const FRAPPE_URL = (import.meta.env.VITE_FRAPPE_URL || 'https://pf.digigalaxy.cloud').replace(/\/$/, '')

type FrappeResponse<T> = { message: T }

function methodUrl(method: string, params?: Record<string, string | number | boolean | undefined | null>) {
  const url = new URL(`${FRAPPE_URL}/api/method/${method}`)
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value))
  })
  return url.toString()
}

async function readFrappeError(res: Response) {
  const body = await res.json().catch(() => ({}))
  return body._server_messages
    ? JSON.parse(JSON.parse(body._server_messages)[0]).message
    : body.exception || body.exc_type || body.message || 'Request failed'
}

async function rpc<T>(method: string, params?: Record<string, string | number | boolean | undefined | null>, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(methodUrl(method, opts.method === 'POST' ? undefined : params), {
    ...opts,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(opts.body ? { 'Content-Type': 'application/json' } : {}),
      ...(opts.headers || {}),
    },
    body: opts.method === 'POST' && params ? JSON.stringify(params) : opts.body,
  })
  if (!res.ok) throw new Error(await readFrappeError(res))
  const data = await res.json() as FrappeResponse<T>
  return data.message
}

function mapCountrySchema(response: CountrySchemaResponse): Country {
  const code = response.country.name
  return {
    code,
    name: response.country.country_name,
    local_name: response.country.country_name,
    flag_emoji: code === 'GB' ? '🇬🇧' : code === 'US' ? '🇺🇸' : code === 'PK' ? '🇵🇰' : '',
    default_language: 'en',
    languages: [{ code: 'en', name_en: 'English', name_local: 'English', rtl: false, default: true }],
    date_format: 'YYYY-MM-DD',
    postal_code_format: '',
    phone_country_code: '',
    currency_code: response.country.currency || '',
    address_format: '',
    address_line_order: [],
    bbox: [],
    bounds_geojson: null,
    regions: [],
    schema: {
      country: code,
      name: response.schema?.schema_code || `${code}-BUSINESS-1`,
      version: Number(response.schema?.version || 1),
      active: Boolean(response.schema),
      fields: response.fields.map(field => ({
        field_key: field.field_key,
        label_en: field.label,
        label_local: '',
        field_type: field.field_type === 'Small Text' || field.field_type === 'Long Text' ? 'textarea' : field.field_type.toLowerCase(),
        required: Boolean(field.required),
        searchable: false,
        unique_scope: '',
        validation_regex: '',
        min_length: null,
        max_length: null,
        choices_json: field.options_json ? JSON.parse(field.options_json) : [],
        help_text_en: field.help_text || '',
        help_text_local: '',
        display_order: field.sort_order || 0,
        section: 'business',
        is_identifier: ['registration_number', 'tax_number', 'vat_number'].includes(field.field_key),
        identifier_type: field.field_key.includes('vat') ? 'VAT' : field.field_key.includes('tax') ? 'TAX' : 'CR',
        public_default: true,
      })),
      documents: response.documents.map(document => ({
        document_key: document.document_key,
        name_en: document.label,
        name_local: '',
        required: Boolean(document.required),
        has_expiry: false,
        requires_document_number: false,
        requires_attachment: true,
        scan_supported: false,
        display_order: document.sort_order || 0,
      })),
    },
  }
}

export const api = {
  listCountries: async () => {
    const countries = await Promise.all(['GB', 'US', 'PK'].map(code => api.getCountryConfig(code)))
    return countries.filter(Boolean) as Country[]
  },
  getCountry: (code: string) => api.getCountryConfig(code),
  getCountryConfig: async (code: string) => mapCountrySchema(await rpc<CountrySchemaResponse>('gop.api.gbid_get_country_schema', { country_code: code })),

  signup: async (data: { email: string; password: string; password2: string; full_name: string }) => {
    if (data.password !== data.password2) throw new Error('Passwords do not match')
    await rpc('gop.api.gbid_signup_user', { email: data.email, password: data.password, full_name: data.full_name }, { method: 'POST' })
    return { ok: true, status: 200, email: data.email, error: '', devCode: '' }
  },

  login: async (data: { email: string; password: string }) => {
    await rpc('login', { usr: data.email, pwd: data.password }, { method: 'POST' })
    return { ok: true, status: 200, devCode: '', error: '', email: data.email }
  },

  logout: () => rpc('logout').catch(() => null),
  getMe: () => rpc<User | null>('gop.api.gbid_get_me').catch(() => null),
  getHealth: async (): Promise<HealthResponse> => ({ status: 'ok', database: 'frappe', service: 'gop-gbid', version: '0.1.0' }),
  getMyBusinesses: () => rpc<{ businesses: Business[] }>('gop.api.gbid_get_my_businesses'),
  createBusiness: (payload: Record<string, string>) => rpc<{ status: string; business: Business }>('gop.api.gbid_create_business', payload, { method: 'POST' }),
  getPublicBusiness: (slugOrGbid: string) => rpc<{ business: Business }>('gop.api.gbid_public_business', { slug_or_gbid: slugOrGbid }),
}
