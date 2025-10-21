/**
 * Ship Constants - Ship types and their configurations
 */

export const SHIP_TYPES = {
  PHOENIX_WING: {
    id: 'phoenixWing',
    name: 'Phoenix Wing',
    character: 'kaden',
    description: 'Kaden\'s signature ship. Balanced stats with bonus damage on kills.',
    stats: {
      speed: 5,
      maxHealth: 100,
      damageMultiplier: 1.0,
      fireRateMultiplier: 1.0,
      shieldCapacity: 100
    },
    special: {
      name: 'Phoenix Fury',
      description: '+10% damage for 5 seconds after each kill',
      bonus: 0.1,
      duration: 5000
    },
    color: '#0088ff',
    cost: 0, // Default ship
    unlocked: true
  },

  STELLAR_ARROW: {
    id: 'stellarArrow',
    name: 'Stellar Arrow',
    character: 'adelynn',
    description: 'Adelynn\'s tactical ship. Fast and agile with strategic bonuses.',
    stats: {
      speed: 6,
      maxHealth: 90,
      damageMultiplier: 0.9,
      fireRateMultiplier: 1.1,
      shieldCapacity: 90
    },
    special: {
      name: 'Tactical Analysis',
      description: '+15% XP gain and +10% critical hit chance',
      xpBonus: 0.15,
      critChance: 0.1
    },
    color: '#ff00ff',
    cost: 0, // Default ship
    unlocked: true
  },

  VOID_HUNTER: {
    id: 'voidHunter',
    name: 'Void Hunter',
    character: 'neutral',
    description: 'Heavy assault ship. Slow but devastating firepower.',
    stats: {
      speed: 3,
      maxHealth: 150,
      damageMultiplier: 1.3,
      fireRateMultiplier: 0.8,
      shieldCapacity: 150
    },
    special: {
      name: 'Heavy Armor',
      description: 'Reduce all damage taken by 25%',
      damageReduction: 0.25
    },
    color: '#440044',
    cost: 5000,
    unlocked: false
  },

  STAR_DANCER: {
    id: 'starDancer',
    name: 'Star Dancer',
    character: 'neutral',
    description: 'Ultra-fast interceptor. High risk, high reward.',
    stats: {
      speed: 8,
      maxHealth: 70,
      damageMultiplier: 0.8,
      fireRateMultiplier: 1.3,
      shieldCapacity: 70
    },
    special: {
      name: 'Afterburner',
      description: 'Dodge rolls grant brief invulnerability',
      dodgeInvul: true,
      dodgeDuration: 500
    },
    color: '#ffaa00',
    cost: 7500,
    unlocked: false
  },

  COSMIC_DEFENDER: {
    id: 'cosmicDefender',
    name: 'Cosmic Defender',
    character: 'neutral',
    description: 'Tank build with shield regeneration.',
    stats: {
      speed: 4,
      maxHealth: 120,
      damageMultiplier: 1.1,
      fireRateMultiplier: 0.9,
      shieldCapacity: 150
    },
    special: {
      name: 'Shield Regeneration',
      description: 'Shields regenerate 5 per second when not taking damage',
      shieldRegen: 5,
      regenDelay: 3000
    },
    color: '#00ff88',
    cost: 10000,
    unlocked: false
  },

  // New Ships - Tier 2
  SHADOW_STRIKER: {
    id: 'shadowStriker',
    name: 'Shadow Striker',
    character: 'neutral',
    description: 'Stealth ship with critical hit bonuses.',
    stats: { speed: 7, maxHealth: 85, damageMultiplier: 1.2, fireRateMultiplier: 1.0, shieldCapacity: 80 },
    special: { name: 'Shadow Strike', description: '30% critical hit chance dealing 2x damage', critChance: 0.3, critMultiplier: 2.0 },
    color: '#4a0e4e',
    cost: 15000,
    unlocked: false
  },

  CRIMSON_RAGE: {
    id: 'crimsonRage',
    name: 'Crimson Rage',
    character: 'neutral',
    description: 'Aggressive fighter that gets stronger at low health.',
    stats: { speed: 6, maxHealth: 100, damageMultiplier: 1.0, fireRateMultiplier: 1.0, shieldCapacity: 100 },
    special: { name: 'Berserker Mode', description: '+50% damage when below 30% health', lowHealthThreshold: 0.3, lowHealthBonus: 0.5 },
    color: '#cc0000',
    cost: 12000,
    unlocked: false
  },

  THUNDER_BOLT: {
    id: 'thunderBolt',
    name: 'Thunder Bolt',
    character: 'neutral',
    description: 'Lightning-fast ship with chain lightning weapons.',
    stats: { speed: 9, maxHealth: 75, damageMultiplier: 0.9, fireRateMultiplier: 1.4, shieldCapacity: 75 },
    special: { name: 'Chain Lightning', description: 'Bullets jump to nearby enemies', chainRange: 100, chainTargets: 2 },
    color: '#ffff00',
    cost: 18000,
    unlocked: false
  },

  ICE_BREAKER: {
    id: 'iceBreaker',
    name: 'Ice Breaker',
    character: 'neutral',
    description: 'Freezes enemies on hit, slowing their movement.',
    stats: { speed: 5, maxHealth: 110, damageMultiplier: 1.0, fireRateMultiplier: 0.9, shieldCapacity: 110 },
    special: { name: 'Cryogenic Blast', description: 'Bullets slow enemies by 40% for 2 seconds', slowPercent: 0.4, slowDuration: 2000 },
    color: '#00ccff',
    cost: 16000,
    unlocked: false
  },

  PLASMA_REAPER: {
    id: 'plasmaReaper',
    name: 'Plasma Reaper',
    character: 'neutral',
    description: 'Energy vampire that heals from kills.',
    stats: { speed: 6, maxHealth: 95, damageMultiplier: 1.1, fireRateMultiplier: 1.0, shieldCapacity: 95 },
    special: { name: 'Life Steal', description: 'Heal 10% of max health on enemy kill', healPercent: 0.1 },
    color: '#ff00cc',
    cost: 20000,
    unlocked: false
  },

  // Tier 3
  NOVA_BOMBER: {
    id: 'novaBomber',
    name: 'Nova Bomber',
    character: 'neutral',
    description: 'Heavy bomber with explosive area damage.',
    stats: { speed: 3, maxHealth: 140, damageMultiplier: 1.5, fireRateMultiplier: 0.7, shieldCapacity: 140 },
    special: { name: 'Explosive Rounds', description: 'Bullets explode on impact, damaging nearby enemies', explosionRadius: 80, explosionDamagePercent: 0.5 },
    color: '#ff6600',
    cost: 25000,
    unlocked: false
  },

  QUANTUM_PHANTOM: {
    id: 'quantumPhantom',
    name: 'Quantum Phantom',
    character: 'neutral',
    description: 'Phase through enemies and bullets periodically.',
    stats: { speed: 7, maxHealth: 80, damageMultiplier: 1.0, fireRateMultiplier: 1.2, shieldCapacity: 80 },
    special: { name: 'Quantum Phase', description: 'Become invulnerable for 1 second every 8 seconds', phaseDuration: 1000, phaseCooldown: 8000 },
    color: '#8844ff',
    cost: 30000,
    unlocked: false
  },

  SOLAR_FLARE: {
    id: 'solarFlare',
    name: 'Solar Flare',
    character: 'neutral',
    description: 'Burns enemies with intense solar energy over time.',
    stats: { speed: 6, maxHealth: 100, damageMultiplier: 0.8, fireRateMultiplier: 1.3, shieldCapacity: 100 },
    special: { name: 'Burn Effect', description: 'Enemies take 20 damage per second for 3 seconds', burnDamage: 20, burnDuration: 3000 },
    color: '#ffaa00',
    cost: 28000,
    unlocked: false
  },

  TOXIC_VENOM: {
    id: 'toxicVenom',
    name: 'Toxic Venom',
    character: 'neutral',
    description: 'Poisons enemies, dealing damage over time.',
    stats: { speed: 6, maxHealth: 90, damageMultiplier: 0.9, fireRateMultiplier: 1.2, shieldCapacity: 90 },
    special: { name: 'Toxic Payload', description: 'Poison enemies for 30 damage over 5 seconds', poisonDamage: 30, poisonDuration: 5000 },
    color: '#00ff00',
    cost: 22000,
    unlocked: false
  },

  DIVINE_GUARDIAN: {
    id: 'divineGuardian',
    name: 'Divine Guardian',
    character: 'neutral',
    description: 'Holy ship with automatic revival ability.',
    stats: { speed: 4, maxHealth: 110, damageMultiplier: 1.0, fireRateMultiplier: 1.0, shieldCapacity: 120 },
    special: { name: 'Divine Protection', description: 'Revive once per life with 50% health', reviveHealth: 0.5, reviveAvailable: true },
    color: '#ffdd00',
    cost: 35000,
    unlocked: false
  },

  // Tier 4 - Elite Ships
  VOID_ANNIHILATOR: {
    id: 'voidAnnihilator',
    name: 'Void Annihilator',
    character: 'neutral',
    description: 'Harness dark matter for devastating attacks.',
    stats: { speed: 5, maxHealth: 130, damageMultiplier: 1.6, fireRateMultiplier: 0.8, shieldCapacity: 130 },
    special: { name: 'Dark Matter Burst', description: 'Every 5th shot deals 3x damage and pierces enemies', burstInterval: 5, burstMultiplier: 3.0, pierce: true },
    color: '#220022',
    cost: 40000,
    unlocked: false
  },

  CELESTIAL_MONARCH: {
    id: 'celestialMonarch',
    name: 'Celestial Monarch',
    character: 'neutral',
    description: 'Royal flagship with balanced excellence.',
    stats: { speed: 6, maxHealth: 120, damageMultiplier: 1.3, fireRateMultiplier: 1.1, shieldCapacity: 130 },
    special: { name: 'Royal Authority', description: '+20% to all stats, +10% XP gain', allStatsBonus: 0.2, xpBonus: 0.1 },
    color: '#9966ff',
    cost: 45000,
    unlocked: false
  },

  CHRONO_WARPER: {
    id: 'chronoWarper',
    name: 'Chrono Warper',
    character: 'neutral',
    description: 'Manipulate time to slow enemies and speed up bullets.',
    stats: { speed: 7, maxHealth: 90, damageMultiplier: 1.1, fireRateMultiplier: 1.3, shieldCapacity: 90 },
    special: { name: 'Time Dilation', description: 'Enemies move 30% slower, your bullets 50% faster', enemySlowdown: 0.3, bulletSpeedup: 0.5 },
    color: '#00aaff',
    cost: 50000,
    unlocked: false
  },

  APOCALYPSE_RIDER: {
    id: 'apocalypseRider',
    name: 'Apocalypse Rider',
    character: 'neutral',
    description: 'Harbinger of destruction. High risk, massive reward.',
    stats: { speed: 8, maxHealth: 60, damageMultiplier: 2.0, fireRateMultiplier: 1.5, shieldCapacity: 60 },
    special: { name: 'Death\'s Touch', description: 'Double damage, but enemies also deal double damage', damageBonus: 1.0, damageTakenMultiplier: 2.0 },
    color: '#ff0000',
    cost: 55000,
    unlocked: false
  },

  // Legendary Ships
  SUPERNOVA_PRIME: {
    id: 'supernovaPrime',
    name: 'Supernova Prime',
    character: 'neutral',
    description: 'The ultimate weapon. Legendary fusion ship.',
    stats: { speed: 8, maxHealth: 150, damageMultiplier: 2.5, fireRateMultiplier: 1.8, shieldCapacity: 200 },
    special: { name: 'Stellar Overload', description: 'All abilities active: crits, life steal, explosions, time slow', multiAbility: true, critChance: 0.25, healPercent: 0.05, explosionRadius: 60, enemySlowdown: 0.2 },
    color: '#ff00ff',
    cost: 100000,
    unlocked: false,
    requirement: 'Unlock all other ships'
  }
};

// Ship visual configurations
export const SHIP_VISUALS = {
  phoenixWing: {
    shape: 'triangle',
    primaryColor: '#0088ff',
    secondaryColor: '#00ccff',
    glowColor: '#0088ff',
    trailColor: '#0088ff'
  },

  stellarArrow: {
    shape: 'arrow',
    primaryColor: '#ff00ff',
    secondaryColor: '#ff88ff',
    glowColor: '#ff00ff',
    trailColor: '#ff00ff'
  },

  voidHunter: {
    shape: 'heavy',
    primaryColor: '#440044',
    secondaryColor: '#880088',
    glowColor: '#ff00ff',
    trailColor: '#440044'
  },

  starDancer: {
    shape: 'dart',
    primaryColor: '#ffaa00',
    secondaryColor: '#ffdd44',
    glowColor: '#ffaa00',
    trailColor: '#ffaa00'
  },

  cosmicDefender: {
    shape: 'shield',
    primaryColor: '#00ff88',
    secondaryColor: '#00ffaa',
    glowColor: '#00ff88',
    trailColor: '#00ff88'
  }
};

// Ship unlock requirements
export const SHIP_UNLOCK_REQUIREMENTS = {
  voidHunter: {
    score: 10000,
    level: 5,
    achievement: 'boss_defeated'
  },

  starDancer: {
    score: 25000,
    level: 10,
    achievement: 'score_5000'
  },

  cosmicDefender: {
    score: 50000,
    level: 15,
    achievement: 'high_scorer'
  }
};

