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

export function sessionCookie(token: string) {
  const secure =
    process.env.NODE_ENV === 'production'
      ? '; Secure; SameSite=None; Partitioned'
      : '; SameSite=Lax'

  return `zpf_session=${token}; HttpOnly${secure}; Path=/; Max-Age=${7 * 24 * 60 * 60}`
}

export const clearSessionCookie =
  process.env.NODE_ENV === 'production'
    ? 'zpf_session=; HttpOnly; Secure; SameSite=None; Partitioned; Path=/; Max-Age=0'
    : 'zpf_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0'
