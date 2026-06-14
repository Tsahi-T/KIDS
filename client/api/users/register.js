import { put } from '@vercel/blob'
import { loadRegistry, saveRegistry, hashPin } from '../_registry.js'
import crypto from 'crypto'

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN
const MAX_USERS = 20

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  let body = req.body
  if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }

  const { name, pin, avatar, avatarBase64 } = body ?? {}

  if (!name || typeof name !== 'string' || name.trim().length < 1)
    return res.status(400).json({ ok: false, error: 'invalid_name' })
  if (!pin || !/^\d{4}$/.test(String(pin)))
    return res.status(400).json({ ok: false, error: 'invalid_pin' })

  const trimmedName = name.trim().slice(0, 12)

  const registry = await loadRegistry()

  if (registry.users.length >= MAX_USERS)
    return res.status(400).json({ ok: false, error: 'max_users' })

  const nameTaken = registry.users.some(
    u => u.name.toLowerCase() === trimmedName.toLowerCase()
  )
  if (nameTaken)
    return res.status(400).json({ ok: false, error: 'name_taken' })

  const userId = 'u_' + crypto.randomBytes(5).toString('hex')

  let finalAvatar = avatar || '🦊'

  if (avatarBase64) {
    try {
      const base64Data = avatarBase64.replace(/^data:image\/\w+;base64,/, '')
      const buffer = Buffer.from(base64Data, 'base64')
      const { url } = await put(`avatars/${userId}.jpg`, buffer, {
        access: 'public',
        token: TOKEN,
        contentType: 'image/jpeg',
        addRandomSuffix: false,
      })
      finalAvatar = `url:${url}`
    } catch {
      // Fall back to chosen emoji
    }
  }

  const newUser = {
    userId,
    name: trimmedName,
    avatar: finalAvatar,
    pinHash: hashPin(pin),
    isAdmin: false,
    createdAt: new Date().toISOString(),
  }

  registry.users.push(newUser)
  await saveRegistry(registry)

  res.json({ ok: true, userId, name: trimmedName, avatar: finalAvatar })
}
