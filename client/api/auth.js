import { list } from '@vercel/blob'

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN

async function loadProfile(userId) {
  try {
    const { blobs } = await list({ prefix: `users/${userId}.json`, limit: 1 })
    if (!blobs.length) return { userId, coins: 0, games: {} }
    const r = await fetch(blobs[0].url, {
      cache: 'no-store',
      headers: { Authorization: `Bearer ${TOKEN}` },
    })
    if (!r.ok) return { userId, coins: 0, games: {} }
    return await r.json()
  } catch {
    return { userId, coins: 0, games: {} }
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  let body = req.body
  if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }

  const { user, pin } = body ?? {}
  if (!user || !pin) return res.status(400).json({ ok: false })

  const correctPin = process.env[`PIN_${String(user).toUpperCase()}`]
  if (!correctPin) return res.status(400).json({ ok: false, error: 'unknown_user' })
  if (correctPin !== String(pin)) return res.status(401).json({ ok: false, error: 'wrong_pin' })

  const profile = await loadProfile(user)
  res.json({ ok: true, profile })
}
