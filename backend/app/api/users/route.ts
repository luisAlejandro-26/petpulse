import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, AuthedRequest, jsonError } from '@/lib/errors'
import { getClient } from '@/lib/db'

export const runtime = 'nodejs'

// GET /api/users?search= - Listar usuarios (solo ADMIN). Admite búsqueda por nombre o correo.
export const GET = requireAdmin(async (req: AuthedRequest) => {
  try {
    const client = getClient()
    const url = new URL(req.url)
    const search = (url.searchParams.get('search') ?? '').trim().toLowerCase()

    let query = client
      .from('users')
      .select('id_user, name_user, email, role_account, profile_image_url, created_at')
      .order('created_at', { ascending: false })

    if (search) {
      query = query.or(`name_user.ilike.%${search}%,email.ilike.%${search}%`)
    }

    const { data: users, error } = await query

    if (error) throw new Error(error.message)

    return NextResponse.json({ users: users ?? [] })
  } catch (error) {
    console.error('Error en GET /api/users:', error)
    return jsonError('Error interno del servidor', 500)
  }
})
