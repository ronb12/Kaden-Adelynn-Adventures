// Customization system for ships, trails, bullets, and UI themes

const CUSTOMIZATION_KEY = 'gameCustomization'

// Available customizations
export const customizationOptions = {
  shipSkins: {
    default: { name: 'Default', unlocked: true, cost: 0 },
    neon: { name: 'Neon', unlocked: false, cost: 500 },
    gold: { name: 'Gold', unlocked: false, cost: 1000 },
    chrome: { name: 'Chrome', unlocked: false, cost: 1500 },
    rainbow: { name: 'Rainbow', unlocked: false, cost: 2000 },
    dark: { name: 'Dark', unlocked: false, cost: 800 },
    ice: { name: 'Ice', unlocked: false, cost: 1200 },
    fire: { name: 'Fire', unlocked: false, cost: 1200 },
  },
  trailEffects: {
    none: { name: 'None', unlocked: true, cost: 0 },
    sparkles: { name: 'Sparkles', unlocked: false, cost: 300 },
    flames: { name: 'Flames', unlocked: false, cost: 500 },
    electric: { name: 'Electric', unlocked: false, cost: 600 },
    rainbow: { name: 'Rainbow Trail', unlocked: false, cost: 1000 },
    stars: { name: 'Stars', unlocked: false, cost: 400 },
    smoke: { name: 'Smoke', unlocked: false, cost: 350 },
  },
  bulletStyles: {
    default: { name: 'Default', unlocked: true, cost: 0 },
    neon: { name: 'Neon Bullets', unlocked: false, cost: 400 },
    glowing: { name: 'Glowing', unlocked: false, cost: 600 },
    particle: { name: 'Particle Trail', unlocked: false, cost: 800 },
    energy: { name: 'Energy', unlocked: false, cost: 700 },
  },
  uiThemes: {
    default: { name: 'Default', unlocked: true, cost: 0 },
    dark: { name: 'Dark Mode', unlocked: false, cost: 200 },
    neon: { name: 'Neon', unlocked: false, cost: 500 },
    retro: { name: 'Retro', unlocked: false, cost: 400 },
    space: { name: 'Space', unlocked: false, cost: 600 },
  },
}

export function getCustomization() {
  try {
    const saved = localStorage.getItem(CUSTOMIZATION_KEY)
    if (!saved) {
      return {
        selectedShipSkin: 'default',
        selectedTrail: 'none',
        selectedBulletStyle: 'default',
        selectedUITheme: 'default',
        unlocked: {
          shipSkins: ['default'],
          trailEffects: ['none'],
          bulletStyles: ['default'],
          uiThemes: ['default'],
        },
      }
    }
    const custom = JSON.parse(saved)
    // Ensure all fields exist
    return {
      selectedShipSkin: custom.selectedShipSkin || 'default',
      selectedTrail: custom.selectedTrail || 'none',
      selectedBulletStyle: custom.selectedBulletStyle || 'default',
      selectedUITheme: custom.selectedUITheme || 'default',
      unlocked: {
        shipSkins: custom.unlocked?.shipSkins || ['default'],
        trailEffects: custom.unlocked?.trailEffects || ['none'],
        bulletStyles: custom.unlocked?.bulletStyles || ['default'],
        uiThemes: custom.unlocked?.uiThemes || ['default'],
      },
    }
  } catch {
    return {
      selectedShipSkin: 'default',
      selectedTrail: 'none',
      selectedBulletStyle: 'default',
      selectedUITheme: 'default',
      unlocked: {
        shipSkins: ['default'],
        trailEffects: ['none'],
        bulletStyles: ['default'],
        uiThemes: ['default'],
      },
    }
  }
}

export function saveCustomization(customization) {
  try {
    localStorage.setItem(CUSTOMIZATION_KEY, JSON.stringify(customization))
    return true
  } catch {
    return false
  }
}

export function unlockCustomization(category, item, currentCoins) {
  const options = customizationOptions[category]
  if (!options || !options[item]) {
    return { success: false, error: 'Invalid customization' }
  }
  
  const itemData = options[item]
  if (itemData.unlocked) {
    return { success: false, error: 'Already unlocked' }
  }
  
  if (currentCoins < itemData.cost) {
    return { success: false, error: 'Not enough coins', cost: itemData.cost }
  }
  
  try {
    const custom = getCustomization()
    if (!custom.unlocked[category]) {
      custom.unlocked[category] = []
    }
    
    if (!custom.unlocked[category].includes(item)) {
      custom.unlocked[category].push(item)
    }
    
    saveCustomization(custom)
    
    return {
      success: true,
      cost: itemData.cost,
      remainingCoins: currentCoins - itemData.cost,
    }
  } catch {
    return { success: false, error: 'Failed to unlock' }
  }
}

export function selectCustomization(category, item) {
  const custom = getCustomization()
  
  if (!custom.unlocked[category] || !custom.unlocked[category].includes(item)) {
    return { success: false, error: 'Not unlocked' }
  }
  
  try {
    const keyMap = {
      shipSkins: 'selectedShipSkin',
      trailEffects: 'selectedTrail',
      bulletStyles: 'selectedBulletStyle',
      uiThemes: 'selectedUITheme',
    }
    
    custom[keyMap[category]] = item
    saveCustomization(custom)
    
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to select' }
  }
}

export function isUnlocked(category, item) {
  const custom = getCustomization()
  return custom.unlocked[category]?.includes(item) || false
}
