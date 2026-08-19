import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Faltan variables SUPABASE_URL o SUPABASE_ANON_KEY en backend/.env')
}

type TableRow = Record<string, any>

export type Database = {
  public: {
    Tables: {
      users: { Row: TableRow; Insert: TableRow; Update: TableRow; Relationships: [] }
      sessions: { Row: TableRow; Insert: TableRow; Update: TableRow; Relationships: [] }
      pet: { Row: TableRow; Insert: TableRow; Update: TableRow; Relationships: [] }
      health_event: { Row: TableRow; Insert: TableRow; Update: TableRow; Relationships: [] }
      ai_conversations: { Row: TableRow; Insert: TableRow; Update: TableRow; Relationships: [] }
      ai_messages: { Row: TableRow; Insert: TableRow; Update: TableRow; Relationships: [] }
    }
    Views: Record<never, never>
    Functions: Record<never, never>
  }
}

export type Client = SupabaseClient<Database>

type SupabaseGlobal = typeof globalThis & { __petpulseClient?: Client }

export function getClient() {
  const cache = globalThis as SupabaseGlobal
  if (!cache.__petpulseClient) {
    cache.__petpulseClient = createClient<Database>(SUPABASE_URL!, SUPABASE_ANON_KEY!)
  }
  return cache.__petpulseClient
}