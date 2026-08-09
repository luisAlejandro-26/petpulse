import { NextResponse } from 'next/server'
import { getClient } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const client = getClient()

    const { count, error } = await client
      .from('users')
      .select('*', { count: 'exact', head: true })

    if (error) throw new Error(error.message)

    return NextResponse.json({ count: count ?? 0 })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
