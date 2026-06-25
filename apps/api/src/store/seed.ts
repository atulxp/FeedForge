import type { LocalState } from '@zpf/shared'
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

export function hashPassword(password: string, salt = randomBytes(16).toString('hex')) {
  return {
    salt,
    hash: scryptSync(password, salt, 64).toString('hex'),
  }
}

export function verifyPassword(password: string, salt: string, hash: string) {
  const current = scryptSync(password, salt, 64)
  const expected = Buffer.from(hash, 'hex')
  return current.length === expected.length && timingSafeEqual(current, expected)
}

export function createSeedState(): LocalState {
  return {
    users: [],
    sessions: [],
    encryptedTokens: [],
    providerCredentials: [],
    oauthStates: [],
    reports: [],
    accounts: [],
    posts: [],
  }
}
