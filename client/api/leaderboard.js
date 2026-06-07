import { list } from '@vercel/blob'

const FAMILY = ['ofek', 'ori', 'tsahy']
const NAMES  = { ofek: 'אופק', ori: 'אורי', tsahy: 'צאהי' }

async function loadProfile(userId) {
  try {
    const { blobs } = await list({ prefix: `users/${userId}.json`, limit: 1 })
    if (!blobs.length) return { userId, coins: 0, games: {} }
    const r = await fetch(blobs[0].url, { cache: 'no-store' })
    return await r.json()
  } catch {
    return { userId, coins: 0, games: {} }
  }
}

export default async function handler(req, res) {
  try {
    const profiles = await Promise.all(FAMILY.map(loadProfile))
    const board = profiles
      .map(p => ({
        userId: p.userId,
        name:   NAMES[p.userId] || p.userId,
        coins:  p.coins || 0,
        games:  p.games || {},
      }))
      .sort((a, b) => b.coins - a.coins)

    res.json(board)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
