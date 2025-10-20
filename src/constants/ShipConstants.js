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

