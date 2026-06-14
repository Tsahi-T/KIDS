import { del, list } from '@vercel/blob'
import { loadRegistry, saveRegistry, verifyPin } from '../_registry.js'

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  let body = req.body
  if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }

  const { adminPin, targetUserId } = body ?? {}
  if (!adminPin || !targetUserId) return res.status(400).json({ ok: false })

  const registry = await loadRegistry()

  const admin = registry.users.find(u => u.isAdmin)
  if (!admin || !verifyPin(adminPin, admin))
    return res.status(401).json({ ok: false, error: 'unauthorized' })

  const target = registry.users.find(u => u.userId === targetUserId)
  if (!target) return res.status(404).json({ ok: false, error: 'not_found' })
  if (target.isAdmin) return res.status(400).json({ ok: false, error: 'cannot_delete_admin' })

  // Remove from registry
  registry.users = registry.users.filter(u => u.userId !== targetUserId)
  await saveRegistry(registry)

  // Best-effort cleanup of blob data
  try {
    const { blobs: profileBlobs } = await list({ prefix: `users/${targetUserId}.json`, limit: 1, token: TOKEN })
    if (profileBlobs.length) await del(profileBlobs[0].url, { token: TOKEN })
  } catch { /* ignore */ }

  res.json({ ok: true })
}
