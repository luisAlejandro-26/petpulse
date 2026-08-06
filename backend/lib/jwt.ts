import jwt from 'jsonwebtoken'

export interface AuthUser {
  id_user: number
  role_account: string
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('Falta la variable JWT_SECRET en backend/.env')
  }
  return secret
}

export function signToken(
  payload: object,
  expiresInSeconds = 86400
): string {
  return jwt.sign(payload, getSecret(), { expiresIn: expiresInSeconds })
}

export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, getSecret()) as AuthUser
  } catch {
    return null
  }
}
