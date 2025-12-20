// Permanent weapon upgrade system
// Allows players to upgrade weapons with coins for permanent improvements

const UPGRADES_KEY = 'weaponUpgrades'

// Upgrade definitions
export const weaponUpgradeTypes = {
  damage: {
    name: 'Damage',
    description: 'Increases weapon damage',
    maxLevel: 10,
    costPerLevel: [100, 150, 200, 250, 300, 400, 500, 600, 750, 1000],
    effectPerLevel: 0.1, // 10% increase per level
  },
  fireRate: {
    name: 'Fire Rate',
    description: 'Increases shots per second',
    maxLevel: 10,
    costPerLevel: [100, 150, 200, 250, 300, 400, 500, 600, 750, 1000],
    effectPerLevel: 0.08, // 8% increase per level
  },
  range: {
    name: 'Range',
    description: 'Increases bullet travel distance',
    maxLevel: 5,
    costPerLevel: [150, 250, 400, 600, 1000],
    effectPerLevel: 0.2, // 20% increase per level
  },
  accuracy: {
    name: 'Accuracy',
    description: 'Reduces bullet spread',
    maxLevel: 5,
    costPerLevel: [200, 350, 550, 800, 1200],
    effectPerLevel: 0.15, // 15% improvement per level
  },
  special: {
    name: 'Special Effect',
    description: 'Enhances weapon special abilities',
    maxLevel: 3,
    costPerLevel: [500, 1000, 2000],
    effectPerLevel: 0.25, // 25% enhancement per level
  },
}

// Get all upgrades for a weapon
export function getWeaponUpgrades(weaponName) {
  try {
    const saved = localStorage.getItem(UPGRADES_KEY)
    if (!saved) return {}
    const allUpgrades = JSON.parse(saved)
    return allUpgrades[weaponName] || {}
  } catch {
    return {}
  }
}

// Get upgrade level for a specific weapon and upgrade type
export function getUpgradeLevel(weaponName, upgradeType) {
  const upgrades = getWeaponUpgrades(weaponName)
  return upgrades[upgradeType] || 0
}

// Upgrade a weapon
export function upgradeWeapon(weaponName, upgradeType, currentCoins) {
  const upgrades = getWeaponUpgrades(weaponName)
  const currentLevel = upgrades[upgradeType] || 0
  const upgradeDef = weaponUpgradeTypes[upgradeType]
  
  if (!upgradeDef) {
    return { success: false, error: 'Invalid upgrade type' }
  }
  
  if (currentLevel >= upgradeDef.maxLevel) {
    return { success: false, error: 'Max level reached' }
  }
  
  const cost = upgradeDef.costPerLevel[currentLevel]
  if (currentCoins < cost) {
    return { success: false, error: 'Not enough coins', cost }
  }
  
  try {
    const saved = localStorage.getItem(UPGRADES_KEY)
    const allUpgrades = saved ? JSON.parse(saved) : {}
    
    if (!allUpgrades[weaponName]) {
      allUpgrades[weaponName] = {}
    }
    
    allUpgrades[weaponName][upgradeType] = currentLevel + 1
    
    localStorage.setItem(UPGRADES_KEY, JSON.stringify(allUpgrades))
    
    return {
      success: true,
      newLevel: currentLevel + 1,
      cost,
      remainingCoins: currentCoins - cost,
    }
  } catch (error) {
    return { success: false, error: 'Failed to save upgrade' }
  }
}

// Get upgrade cost for next level
export function getUpgradeCost(weaponName, upgradeType) {
  const upgrades = getWeaponUpgrades(weaponName)
  const currentLevel = upgrades[upgradeType] || 0
  const upgradeDef = weaponUpgradeTypes[upgradeType]
  
  if (!upgradeDef || currentLevel >= upgradeDef.maxLevel) {
    return null
  }
  
  return upgradeDef.costPerLevel[currentLevel]
}

// Get upgrade multiplier for a weapon and upgrade type
export function getUpgradeMultiplier(weaponName, upgradeType) {
  const level = getUpgradeLevel(weaponName, upgradeType)
  const upgradeDef = weaponUpgradeTypes[upgradeType]
  
  if (!upgradeDef || level === 0) {
    return 1.0
  }
  
  return 1.0 + (upgradeDef.effectPerLevel * level)
}

// Get all upgrade multipliers for a weapon
export function getWeaponUpgradeMultipliers(weaponName) {
  return {
    damage: getUpgradeMultiplier(weaponName, 'damage'),
    fireRate: getUpgradeMultiplier(weaponName, 'fireRate'),
    range: getUpgradeMultiplier(weaponName, 'range'),
    accuracy: getUpgradeMultiplier(weaponName, 'accuracy'),
    special: getUpgradeMultiplier(weaponName, 'special'),
  }
}

// Reset all upgrades (for testing or reset feature)
export function resetAllUpgrades() {
  try {
    localStorage.removeItem(UPGRADES_KEY)
    return true
  } catch {
    return false
  }
}

// Get total coins spent on upgrades
export function getTotalUpgradeCost() {
  try {
    const saved = localStorage.getItem(UPGRADES_KEY)
    if (!saved) return 0
    
    const allUpgrades = JSON.parse(saved)
    let total = 0
    
    for (const [weaponName, upgrades] of Object.entries(allUpgrades)) {
      for (const [upgradeType, level] of Object.entries(upgrades)) {
        const upgradeDef = weaponUpgradeTypes[upgradeType]
        if (upgradeDef) {
          for (let i = 0; i < level; i++) {
            total += upgradeDef.costPerLevel[i] || 0
          }
        }
      }
    }
    
    return total
  } catch {
    return 0
  }
}
