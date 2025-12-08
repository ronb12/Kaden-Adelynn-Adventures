const getStore = () => {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch (err) {
    return null
  }
}

export const storageGet = (key, fallback = null) => {
  const store = getStore()
  if (!store) return fallback
  try {
    const value = store.getItem(key)
    return value !== null ? value : fallback
  } catch {
    return fallback
  }
}

export const storageSet = (key, value) => {
  const store = getStore()
  if (!store) return
  try {
    store.setItem(key, value ?? '')
  } catch {
    // ignore write failures (private browsing, quota, etc.)
  }
}

export const storageRemove = (key) => {
  const store = getStore()
  if (!store) return
  try {
    store.removeItem(key)
  } catch {
    // ignore
  }
}
