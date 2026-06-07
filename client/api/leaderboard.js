import { get } from '@vercel/blob'

const FAMILY = ['ofek', 'ori', 'tsahy']
const NAMES  = { ofek: 'אופק', ori: 'אורי', tsahy: 'צאהי' }

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
