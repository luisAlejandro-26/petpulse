import crypto from 'crypto'

export function generateResetCode(): string {
  return crypto.randomInt(100000, 1000000).toString()
}

export function hashResetCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex')
}
