import { list, put } from '@vercel/blob'

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN

async function loadProfile(userId) {
  try {
    const { blobs } = await list({ prefix: `users/${userId}.json`, limit: 1, token: TOKEN })
    if (!blobs.length) return { userId, coins: 0, games: {} }
    const r = await fetch(blobs[0].url, { cache: 'no-store' })
    if (!r.ok) return { userId, coins: 0, games: {} }
    return await r.json()
  } catch {
    return { userId, coins: 0, games: {} }
  }
}

async function saveProfile(userId, profile) {
  await put(`users/${userId}.json`, JSON.stringify(profile), {
    access: 'public',
    token: TOKEN,
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  })
}

export default async function handler(req, res) {
  const { user } = req.query
  if (!user) return res.status(400).json({ error: 'missing user' })

  if (req.method === 'GET') {
    const profile = await loadProfile(user)
    return res.json(profile)
  }

  if (req.method === 'POST') {
    let body = req.body
    if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }

    const { game, score, total, coinDelta, sessionSeconds } = body ?? {}
    const profile = await loadProfile(user)

    if (game) {
      if (!profile.games[game]) profile.games[game] = { played: 0, bestScore: 0, totalSeconds: 0, history: [] }
      const g = profile.games[game]
      g.played++
      g.bestScore     = Math.max(g.bestScore, score ?? 0)
      g.totalSeconds  = (g.totalSeconds || 0) + (sessionSeconds > 0 ? sessionSeconds : 0)
      g.history.push({ date: new Date().toISOString(), score: score ?? 0, total: total ?? 25, seconds: sessionSeconds ?? 0 })
      if (g.history.length > 100) g.history = g.history.slice(-100)
    }

    if (sessionSeconds > 0) profile.totalSeconds = (profile.totalSeconds || 0) + sessionSeconds
    if (coinDelta > 0)      profile.coins        = (profile.coins || 0) + coinDelta

    await saveProfile(user, profile)
    return res.json({ ok: true, coins: profile.coins })
  }

  res.status(405).end()
}
