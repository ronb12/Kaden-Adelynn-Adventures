// Upgrade system utility functions
// Checks if upgrades are purchased and provides upgrade effects

export function hasUpgrade(key) {
  try {
    return localStorage.getItem(`upgrade_${key}`) === '1'
  } catch {
    return false
  }
}

export function getAllUpgrades() {
  const upgradeKeys = [
    'life', 'shield', 'speed', 'rapid', 'damage', 'health', 'multishot', 'doubler',
    'penetration', 'homing', 'explosive', 'regeneration', 'shield_master',
    'plasma_core', 'time_dilation', 'immortality', 'ultimate_power',
    'bullet_size', 'crit_chance', 'armor_piercing', 'energy_shield', 'auto_aim',
    'chain_lightning', 'freeze_shot', 'poison_shot', 'magnetic_pull',
    'double_jump', 'phase_shift', 'berserker', 'luck_boost'
  ]
  
  const upgrades = {}
  upgradeKeys.forEach(key => {
    upgrades[key] = hasUpgrade(key)
  })
  return upgrades
}

// Get upgrade multipliers/effects
export function getUpgradeEffects() {
  const upgrades = getAllUpgrades()
  
  return {
    // Movement
    speedMultiplier: upgrades.speed ? 1.3 : upgrades.ultimate_power ? 2.0 : 1.0,
    
    // Combat
    damageMultiplier: upgrades.damage ? 1.4 : upgrades.plasma_core ? 3.0 : upgrades.ultimate_power ? 4.0 : 1.0,
    fireRateMultiplier: upgrades.rapid ? 2.0 : upgrades.ultimate_power ? 3.0 : 1.0,
    multishot: upgrades.multishot ? 3 : upgrades.ultimate_power ? 5 : 1,
    
    // Defense
    maxHealthMultiplier: upgrades.health ? 1.5 : upgrades.ultimate_power ? 2.5 : 1.0,
    damageReduction: upgrades.immortality ? 0.9 : upgrades.ultimate_power ? 0.95 : 0,
    shieldDurationMultiplier: upgrades.shield ? 1.5 : upgrades.shield_master ? 3.0 : upgrades.ultimate_power ? 4.0 : 1.0,
    healthRegen: upgrades.regeneration || upgrades.ultimate_power,
    
    // Special abilities
    penetration: upgrades.penetration || upgrades.ultimate_power,
    homing: upgrades.homing || upgrades.ultimate_power,
    explosive: upgrades.explosive || upgrades.ultimate_power,
    timeSlow: upgrades.time_dilation || upgrades.ultimate_power,
    
    // Currency
    starMultiplier: upgrades.doubler ? 2.0 : upgrades.ultimate_power ? 3.0 : 1.0,
    
    // Extra lives
    extraLives: upgrades.life ? 1 : upgrades.ultimate_power ? 3 : 0,
    
    // Advanced abilities
    bulletSize: upgrades.bullet_size || upgrades.ultimate_power,
    critChance: upgrades.crit_chance ? 0.15 : upgrades.ultimate_power ? 0.3 : 0,
    armorPiercing: upgrades.armor_piercing || upgrades.ultimate_power,
    energyShield: upgrades.energy_shield || upgrades.ultimate_power,
    autoAim: upgrades.auto_aim || upgrades.ultimate_power,
    chainLightning: upgrades.chain_lightning || upgrades.ultimate_power,
    freezeShot: upgrades.freeze_shot || upgrades.ultimate_power,
    poisonShot: upgrades.poison_shot || upgrades.ultimate_power,
    magneticPull: upgrades.magnetic_pull || upgrades.ultimate_power,
    doubleJump: upgrades.double_jump || upgrades.ultimate_power,
    phaseShift: upgrades.phase_shift || upgrades.ultimate_power,
    berserker: upgrades.berserker || upgrades.ultimate_power,
    luckBoost: upgrades.luck_boost ? 1.5 : upgrades.ultimate_power ? 2.0 : 1.0,
  }
}
