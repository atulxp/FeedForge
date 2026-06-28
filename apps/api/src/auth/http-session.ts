import { UnauthorizedException } from '@nestjs/common'
import { LocalStore } from '../store/local.store'

export function readCookie(request: { headers?: { cookie?: string } }, name: string) {
  const cookie = request.headers?.cookie
  if (!cookie) return undefined
  return cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1)
}

export function currentUserId(store: LocalStore, request: { headers?: { cookie?: string } }) {
  const token = readCookie(request, 'zpf_session')
  if (!token) throw new UnauthorizedException('Login required')
  return store.getUserFromToken(token).id
}

import { createHash } from 'crypto'   // if not already imported

export function sessionCookie(token: string) {
  const secure =
    process.env.NODE_ENV === 'production'
      ? '; Secure; SameSite=None'
      : '; SameSite=Lax'

  console.log('Cookie token:', token)
  console.log(
    'Cookie hash:',
    createHash('sha256').update(token).digest('hex'),
  )

  return `zpf_session=${token}; HttpOnly${secure}; Path=/; Max-Age=${7 * 24 * 60 * 60}`
}

export const clearSessionCookie =
  process.env.NODE_ENV === 'production'
    ? 'zpf_session=; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=0'
    : 'zpf_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0'
