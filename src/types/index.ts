export interface User {
  name: string
  email: string
  full_name: string
  enabled: boolean
}

export interface CountrySchemaResponse {
  country: { name: string; country_name: string; currency?: string }
  schema: { name: string; schema_code: string; version: string; description?: string } | null
  fields: Array<{
    field_key: string
    label: string
    field_type: string
    required: number | boolean
    sort_order: number
    options_json?: string | null
    help_text?: string | null
  }>
  documents: Array<{
    document_key: string
    label: string
    required: number | boolean
    sort_order: number
    accepted_file_types?: string | null
    help_text?: string | null
  }>
}

export interface Country {
  code: string
  name: string
  local_name: string
  flag_emoji: string
  default_language: string
  languages: Language[]
  date_format: string
  postal_code_format: string
  phone_country_code: string
  currency_code: string
  address_format: string
  address_line_order: string[]
  bbox: number[]
  bounds_geojson: GeoJSON | null
  regions: RegionNode[]
  schema: CountrySchema | null
}

export interface Language {
  code: string
  name_en: string
  name_local: string
  rtl: boolean
  default: boolean
}

export interface RegionNode {
  code: string
  name_en: string
  local_names: Record<string, string>
  local_name: string
  level: string
  latitude: number | null
  longitude: number | null
  postal_code_prefix: string
  children: RegionNode[]
}

export interface CountrySchema {
  country: string
  name: string
  version: number
  active: boolean
  fields: FieldDefinition[]
  documents: DocumentDefinition[]
}

export interface FieldDefinition {
  field_key: string
  label_en: string
  label_local: string
  field_type: string
  required: boolean
  searchable: boolean
  unique_scope: string
  validation_regex: string
  min_length: number | null
  max_length: number | null
  choices_json: string[]
  help_text_en: string
  help_text_local: string
  display_order: number
  section: string
  is_identifier: boolean
  identifier_type: string
  public_default: boolean
}

export interface DocumentDefinition {
  document_key: string
  name_en: string
  name_local: string
  required: boolean
  has_expiry: boolean
  requires_document_number: boolean
  requires_attachment: boolean
  scan_supported: boolean
  display_order: number
}

export interface Business {
  name: string
  gbid_business_id: string
  legal_name: string
  display_name?: string
  slug?: string
  country: string
  status: string
  verification_status?: string
  website?: string
  email?: string
  phone?: string
  description?: string
  public_profile?: boolean | number
  identifiers?: BusinessIdentifier[]
}

export interface BusinessIdentifier {
  name: string
  identifier_type: string
  identifier_value: string
  country?: string
  is_primary?: boolean | number
  status: string
}

export interface GeoJSON {
  type: string
  coordinates: number[][][] | number[][][][]
}

export interface HealthResponse {
  status: string
  database: string
  service: string
  version: string
}

export interface ApiError {
  error: { code: string; message: string; details?: Record<string, unknown> }
}
