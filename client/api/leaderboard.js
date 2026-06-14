import { list } from '@vercel/blob'
import { loadRegistry } from './_registry.js'

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

export default async function handler(req, res) {
  try {
    const registry = await loadRegistry()
    const profiles = await Promise.all(registry.users.map(u => loadProfile(u.userId)))

    const board = profiles
      .map(p => {
        const meta = registry.users.find(u => u.userId === p.userId) || {}
        return {
          userId:       p.userId,
          name:         meta.name || p.userId,
          avatar:       meta.avatar || '👤',
          coins:        p.coins || 0,
          totalSeconds: p.totalSeconds || 0,
          games:        p.games || {},
        }
      })
      .sort((a, b) => b.coins - a.coins)

    res.json(board)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
