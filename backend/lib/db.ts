import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Faltan variables SUPABASE_URL o SUPABASE_ANON_KEY en backend/.env')
}

type SupabaseGlobal = typeof globalThis & { __petpulseClient?: ReturnType<typeof createClient> }

export function getClient() {
  const cache = globalThis as SupabaseGlobal
  if (!cache.__petpulseClient) {
    cache.__petpulseClient = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!)
  }
  return cache.__petpulseClient
}

export async function query<T = Record<string, unknown>>(
  table: string,
  options: {
    select?: string
    filters?: Record<string, unknown>
    insert?: Record<string, unknown>
    update?: Record<string, unknown>
    delete?: boolean
  } = {}
): Promise<T[]> {
  const client = getClient()
  let queryBuilder = client.from(table).select(options.select ?? '*')

  if (options.filters) {
    for (const [key, value] of Object.entries(options.filters)) {
      queryBuilder = queryBuilder.eq(key, value) as typeof queryBuilder
    }
  }

  const { data, error } = await queryBuilder

  if (error) throw new Error(error.message)
  return (data ?? []) as T[]
}

export async function insert<T = Record<string, unknown>>(
  table: string,
  values: Record<string, unknown>
): Promise<T> {
  const client = getClient()
  const { data, error } = await client
    .from(table)
    .insert(values)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as T
}

export async function update<T = Record<string, unknown>>(
  table: string,
  filters: Record<string, unknown>,
  values: Record<string, unknown>
): Promise<T> {
  const client = getClient()
  let queryBuilder = client.from(table).update(values)

  for (const [key, value] of Object.entries(filters)) {
    queryBuilder = queryBuilder.eq(key, value) as typeof queryBuilder
  }

  const { data, error } = await queryBuilder.select().single()
  if (error) throw new Error(error.message)
  return data as T
}

export async function remove(
  table: string,
  filters: Record<string, unknown>
): Promise<void> {
  const client = getClient()
  let queryBuilder = client.from(table).delete()

  for (const [key, value] of Object.entries(filters)) {
    queryBuilder = queryBuilder.eq(key, value) as typeof queryBuilder
  }

  const { error } = await queryBuilder
  if (error) throw new Error(error.message)
}
