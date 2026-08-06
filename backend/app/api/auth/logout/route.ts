import { NextResponse } from 'next/server'
import { requireAuth, AuthedRequest } from '@/lib/errors'

export const runtime = 'nodejs'

export const POST = requireAuth(async (_req: AuthedRequest) => {
  return NextResponse.json({ success: true })
})
