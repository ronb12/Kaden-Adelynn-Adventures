export function getCoins() {
  try {
    const raw = localStorage.getItem('walletCoins')
    const val = parseInt(raw || '0', 10)
    return Number.isFinite(val) ? val : 0
  } catch {
    return 0
  }
}

export function setCoins(amount) {
  const val = Math.max(0, Math.floor(amount || 0))
  localStorage.setItem('walletCoins', String(val))
  return val
}

export function addCoins(delta) {
  const cur = getCoins()
  return setCoins(cur + Math.floor(delta || 0))
}

export function canAfford(cost) {
  return getCoins() >= Math.floor(cost || 0)
}

export function spendCoins(cost) {
  const c = Math.floor(cost || 0)
  if (!canAfford(c)) return false
  setCoins(getCoins() - c)
  return true
}

export function getOwned(key) {
  try {
    const raw = localStorage.getItem(key) || '[]'
    const list = JSON.parse(raw)
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

export function ownItem(key, id) {
  const list = getOwned(key)
  if (!list.includes(id)) {
    list.push(id)
    localStorage.setItem(key, JSON.stringify(list))
  }
  return list
}

