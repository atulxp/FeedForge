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
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return `zpf_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${7 * 24 * 60 * 60}${secure}`
}

export const clearSessionCookie = 'zpf_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0'
