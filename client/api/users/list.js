import { loadRegistry, publicUsers } from '../_registry.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
  const registry = await loadRegistry()
  res.json(publicUsers(registry))
}
