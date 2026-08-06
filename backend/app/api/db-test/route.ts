import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const rows = await query<{ TOTAL: number }>(
      'SELECT COUNT(*) AS TOTAL FROM USERS'
    )
    return NextResponse.json({ count: Number(rows[0]?.TOTAL ?? 0) })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
