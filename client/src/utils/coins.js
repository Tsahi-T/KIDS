const KEY = 'kids_coins'

export function getCoins() {
  return parseInt(localStorage.getItem(KEY) || '0', 10)
}

export function addCoins(amount) {
  const total = getCoins() + amount
  localStorage.setItem(KEY, String(total))
  return total
}

export function setCoins(val) {
  localStorage.setItem(KEY, String(Math.max(0, val)))
}

export function calcCoins(score, stars) {
  const starBonus = [0, 5, 15, 30][stars] ?? 0
  return score * 10 + starBonus
}
