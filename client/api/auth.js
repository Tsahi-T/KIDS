import { get } from '@vercel/blob'

async function loadProfile(userId) {
  try {
    const result = await get(`users/${userId}.json`, { access: 'public' })
    if (!result || result.statusCode === 404) return { userId, coins: 0, games: {} }
    const chunks = []
    for await (const chunk of result.stream) chunks.push(Buffer.from(chunk))
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
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
