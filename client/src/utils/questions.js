export function generateQuestion() {
  const a = Math.floor(Math.random() * 10) + 1
  const b = Math.floor(Math.random() * 10) + 1
  const correct = a * b

  const pool = new Set([correct])
  const candidates = [
    a * (b + 1), a * (b - 1),
    (a + 1) * b, (a - 1) * b,
    correct + 1, correct - 1,
    correct + 2, correct - 2,
    correct + 10, correct - 10,
  ]
  for (const c of candidates) {
    if (pool.size >= 4) break
    if (c > 0 && c !== correct) pool.add(c)
  }
  while (pool.size < 4) {
    const r = Math.floor(Math.random() * 100) + 1
    if (r !== correct) pool.add(r)
  }

  const answers = [...pool].sort(() => Math.random() - 0.5)
  return { a, b, correct, answers }
}
