// Active key — set once at login; defaults to a guest key that gets wiped each session
let _key = 'kids_coins_guest'

/** Call once at login before any getCoins/addCoins usage. */
export function initCoins(userId, initialValue) {
  _key = userId ? `kids_coins_${userId}` : 'kids_coins_guest'
  // For guests: always reset to 0 so leftover values never carry over
  // For authenticated users: always trust the server value
  localStorage.setItem(_key, String(Math.max(0, initialValue ?? 0)))
}

export function getCoins() {
  return parseInt(localStorage.getItem(_key) || '0', 10)
}

export function addCoins(amount) {
  const total = getCoins() + amount
  localStorage.setItem(_key, String(total))
  return total
}

export function setCoins(val) {
  localStorage.setItem(_key, String(Math.max(0, val)))
}

export function calcCoins(score, stars) {
  const starBonus = [0, 5, 15, 30][stars] ?? 0
  return score * 10 + starBonus
}
