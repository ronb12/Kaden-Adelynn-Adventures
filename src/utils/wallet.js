const WALLET_SCHEMA_VERSION = 1
const WALLET_SCHEMA_KEY = 'walletSchemaVersion'
const OWNED_KEY_WHITELIST = ['ownedShips', 'ownedChars']

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
    if (!Array.isArray(list)) return []
    const onlyStrings = list.filter((item) => typeof item === 'string' && item.trim().length > 0)
    return Array.from(new Set(onlyStrings))
  } catch {
    return []
  }
}

export function ownItem(key, id) {
  if (typeof id !== 'string' || !id) return getOwned(key)
  const list = getOwned(key)
  if (!list.includes(id)) {
    list.push(id)
    localStorage.setItem(key, JSON.stringify(list))
  }
  return list
}

export function ensureWalletSchema() {
  if (typeof localStorage === 'undefined') return
  try {
    const currentVersion = parseInt(localStorage.getItem(WALLET_SCHEMA_KEY) || '0', 10)
    if (currentVersion >= WALLET_SCHEMA_VERSION) return

    // Normalize coin balance
    const coins = getCoins()
    localStorage.setItem('walletCoins', String(Math.max(0, Math.floor(coins || 0))))

    OWNED_KEY_WHITELIST.forEach((key) => {
      const cleaned = getOwned(key)
      localStorage.setItem(key, JSON.stringify(cleaned))
    })

    localStorage.setItem(WALLET_SCHEMA_KEY, String(WALLET_SCHEMA_VERSION))
  } catch (_) {
    // Ignore storage failures
  }
}
