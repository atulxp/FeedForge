import type { LocalState, User } from '@zpf/shared'
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

const now = new Date()
export const demoUserId = 'user-demo'

const hoursAgo = (hours: number) => new Date(now.getTime() - hours * 3_600_000).toISOString()

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

const user = (id: string, email: string, name: string, password: string): User & { passwordHash: string; passwordSalt: string } => {
  const passwordHash = hashPassword(password)
  return {
    id,
    email,
    name,
    createdAt: hoursAgo(24),
    passwordHash: passwordHash.hash,
    passwordSalt: passwordHash.salt,
  }
}

export function createSeedState(): LocalState {
  return {
    users: [
      user(demoUserId, 'founder@zeropointfive.local', 'Founder', 'password123'),
    ],
    sessions: [],
    encryptedTokens: [],
    providerCredentials: [],
    oauthStates: [],
    reports: [],
    accounts: [],
    posts: [],
  }
}
