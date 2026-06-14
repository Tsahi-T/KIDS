import { list, put } from '@vercel/blob'
import crypto from 'crypto'

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN
const SALT  = process.env.PIN_SALT || 'c3kids_salt_2024'
const REGISTRY_PATH = 'users/registry.json'

const SEED_USERS = [
  { userId: 'ofek',  name: 'אופק', avatar: 'photo:OFEK',  pinHash: null, isAdmin: false, createdAt: '2024-01-01T00:00:00Z' },
  { userId: 'ori',   name: 'אורי', avatar: 'photo:ORI',   pinHash: null, isAdmin: false, createdAt: '2024-01-01T00:00:00Z' },
  { userId: 'tsahy', name: 'צחי',  avatar: 'photo:TSAHY', pinHash: null, isAdmin: true,  createdAt: '2024-01-01T00:00:00Z' },
]

export function hashPin(pin) {
  return crypto.createHash('sha256').update(SALT + String(pin)).digest('hex')
}

export function verifyPin(pin, user) {
  if (user.pinHash === null) {
    // Legacy user — check env var
    const envPin = process.env[`PIN_${user.userId.toUpperCase()}`]
    return envPin && envPin === String(pin)
  }
  return user.pinHash === hashPin(pin)
}

export async function loadRegistry() {
  try {
    const { blobs } = await list({ prefix: REGISTRY_PATH, limit: 1, token: TOKEN })
    if (!blobs.length) return { users: SEED_USERS }
    const r = await fetch(blobs[0].url, { cache: 'no-store' })
    if (!r.ok) return { users: SEED_USERS }
    return await r.json()
  } catch {
    return { users: SEED_USERS }
  }
}

export async function saveRegistry(registry) {
  const json = JSON.stringify(registry, null, 2)
  await put(REGISTRY_PATH, json, {
    access: 'public',
    token: TOKEN,
    contentType: 'application/json',
    addRandomSuffix: false,
  })
}

export function publicUsers(registry) {
  return registry.users.map(({ userId, name, avatar, isAdmin, createdAt }) => ({
    userId, name, avatar, isAdmin, createdAt,
  }))
}
