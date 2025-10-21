/**
 * 50 Unique Ship Special Abilities
 * The most comprehensive ability system in any mobile space shooter
 */

export const SHIP_ABILITIES = {
  // OFFENSIVE ABILITIES (1-15)
  CRITICAL_STRIKE: {
    id: 'critical_strike',
    name: 'Critical Strike',
    description: '30% chance to deal 2x damage',
    type: 'offensive',
    effects: { critChance: 0.3, critMultiplier: 2.0 }
  },

  ARMOR_PIERCING: {
    id: 'armor_piercing',
    name: 'Armor Piercing',
    description: 'Bullets ignore 50% of enemy defense',
    type: 'offensive',
    effects: { armorPierce: 0.5 }
  },

  TRIPLE_SHOT: {
    id: 'triple_shot',
    name: 'Triple Shot',
    description: 'Fire 3 bullets in a spread pattern',
    type: 'offensive',
    effects: { bulletCount: 3, spreadAngle: 15 }
  },

  RAPID_ASSAULT: {
    id: 'rapid_assault',
    name: 'Rapid Assault',
    description: '+40% fire rate, -10% damage',
    type: 'offensive',
    effects: { fireRateBonus: 0.4, damagePenalty: -0.1 }
  },

  HEAVY_ORDINANCE: {
    id: 'heavy_ordinance',
    name: 'Heavy Ordinance',
    description: '+60% damage, -30% fire rate',
    type: 'offensive',
    effects: { damageBonus: 0.6, fireRatePenalty: -0.3 }
  },

  CHAIN_LIGHTNING: {
    id: 'chain_lightning',
    name: 'Chain Lightning',
    description: 'Bullets jump to 2 nearby enemies within 100px',
    type: 'offensive',
    effects: { chainTargets: 2, chainRange: 100 }
  },

  EXPLOSIVE_ROUNDS: {
    id: 'explosive_rounds',
    name: 'Explosive Rounds',
    description: 'Bullets explode on impact (80px radius, 50% damage)',
    type: 'offensive',
    effects: { explosionRadius: 80, explosionDamage: 0.5 }
  },

  PIERCING_SHOTS: {
    id: 'piercing_shots',
    name: 'Piercing Shots',
    description: 'Bullets pierce through enemies (hits 3 targets)',
    type: 'offensive',
    effects: { pierce: true, pierceCount: 3 }
  },

  HOMING_MISSILES: {
    id: 'homing_missiles',
    name: 'Homing Missiles',
    description: 'All bullets home towards nearest enemy',
    type: 'offensive',
    effects: { homing: true, homingStrength: 0.15 }
  },

  BURST_FIRE: {
    id: 'burst_fire',
    name: 'Burst Fire',
    description: 'Fire 5 rapid shots, then cooldown',
    type: 'offensive',
    effects: { burstCount: 5, burstDelay: 50, cooldown: 1000 }
  },

  OVERCHARGE: {
    id: 'overcharge',
    name: 'Overcharge',
    description: 'Every 5th shot deals 3x damage',
    type: 'offensive',
    effects: { chargeInterval: 5, chargeMultiplier: 3.0 }
  },

  SHRAPNEL_BLAST: {
    id: 'shrapnel_blast',
    name: 'Shrapnel Blast',
    description: 'On kill, spawn 5 shrapnel projectiles',
    type: 'offensive',
    effects: { shrapnelCount: 5, shrapnelDamage: 0.3 }
  },

  DISINTEGRATE: {
    id: 'disintegrate',
    name: 'Disintegrate',
    description: '15% chance to instantly kill non-boss enemies',
    type: 'offensive',
    effects: { instantKillChance: 0.15 }
  },

  SEEKING_BARRAGE: {
    id: 'seeking_barrage',
    name: 'Seeking Barrage',
    description: 'Fire 10 seeking missiles with 1s cooldown',
    type: 'offensive',
    effects: { missileCount: 10, missileSpread: 360, cooldown: 1000 }
  },

  LASER_BEAM: {
    id: 'laser_beam',
    name: 'Continuous Laser',
    description: 'Hold to fire continuous laser beam (200 DPS)',
    type: 'offensive',
    effects: { continuousBeam: true, beamDPS: 200 }
  },

  // DEFENSIVE ABILITIES (16-25)
  SHIELD_REGENERATION: {
    id: 'shield_regen',
    name: 'Shield Regeneration',
    description: 'Regenerate 5 shield per second after 3s without damage',
    type: 'defensive',
    effects: { shieldRegen: 5, regenDelay: 3000 }
  },

  ADAPTIVE_ARMOR: {
    id: 'adaptive_armor',
    name: 'Adaptive Armor',
    description: 'Take 25% less damage from all sources',
    type: 'defensive',
    effects: { damageReduction: 0.25 }
  },

  REFLECT_SHIELD: {
    id: 'reflect_shield',
    name: 'Reflect Shield',
    description: '20% chance to reflect enemy bullets back',
    type: 'defensive',
    effects: { reflectChance: 0.2 }
  },

  EMERGENCY_BARRIER: {
    id: 'emergency_barrier',
    name: 'Emergency Barrier',
    description: 'Auto-shield when health drops below 25%',
    type: 'defensive',
    effects: { emergencyShield: true, healthThreshold: 0.25, shieldDuration: 3000 }
  },

  DIVINE_PROTECTION: {
    id: 'divine_protection',
    name: 'Divine Protection',
    description: 'Revive once per life at 50% health',
    type: 'defensive',
    effects: { autoRevive: true, reviveHealth: 0.5 }
  },

  PHASE_SHIFT: {
    id: 'phase_shift',
    name: 'Phase Shift',
    description: 'Become invulnerable for 1s every 8 seconds',
    type: 'defensive',
    effects: { phaseDuration: 1000, phaseCooldown: 8000 }
  },

  FORTIFY: {
    id: 'fortify',
    name: 'Fortify',
    description: '+50% max health',
    type: 'defensive',
    effects: { maxHealthBonus: 0.5 }
  },

  BARRIER_FIELD: {
    id: 'barrier_field',
    name: 'Barrier Field',
    description: 'Create barrier that blocks 5 hits, recharges every 10s',
    type: 'defensive',
    effects: { barrierHits: 5, barrierCooldown: 10000 }
  },

  EVASION_MATRIX: {
    id: 'evasion_matrix',
    name: 'Evasion Matrix',
    description: '15% chance to dodge any attack',
    type: 'defensive',
    effects: { dodgeChance: 0.15 }
  },

  REGENERATION: {
    id: 'regeneration',
    name: 'Regeneration',
    description: 'Heal 2 health per second',
    type: 'defensive',
    effects: { healthRegen: 2 }
  },

  // UTILITY ABILITIES (26-35)
  RESOURCE_MAGNET: {
    id: 'resource_magnet',
    name: 'Resource Magnet',
    description: 'Power-ups and credits attracted from 150px range',
    type: 'utility',
    effects: { magneticRange: 150 }
  },

  DOUBLE_REWARDS: {
    id: 'double_rewards',
    name: 'Double Rewards',
    description: '+100% XP and credits earned',
    type: 'utility',
    effects: { xpBonus: 1.0, creditBonus: 1.0 }
  },

  SALVAGE_EXPERT: {
    id: 'salvage_expert',
    name: 'Salvage Expert',
    description: 'Enemies drop bonus credits (50% chance)',
    type: 'utility',
    effects: { bonusDropChance: 0.5, bonusDropAmount: 10 }
  },

  POWER_EXTENSION: {
    id: 'power_extension',
    name: 'Power Extension',
    description: 'Power-ups last 50% longer',
    type: 'utility',
    effects: { powerupDuration: 0.5 }
  },

  QUICK_LEARNER: {
    id: 'quick_learner',
    name: 'Quick Learner',
    description: '+30% XP from all sources',
    type: 'utility',
    effects: { xpBonus: 0.3 }
  },

  TREASURE_HUNTER: {
    id: 'treasure_hunter',
    name: 'Treasure Hunter',
    description: 'Power-ups spawn 2x more frequently',
    type: 'utility',
    effects: { powerupSpawnRate: 2.0 }
  },

  TACTICAL_SCANNER: {
    id: 'tactical_scanner',
    name: 'Tactical Scanner',
    description: 'See enemy health bars and incoming attacks',
    type: 'utility',
    effects: { showEnemyHealth: true, showWarnings: true }
  },

  LUCK_OF_THE_VOID: {
    id: 'luck_void',
    name: 'Luck of the Void',
    description: '10% chance for double score on kills',
    type: 'utility',
    effects: { doubleScoreChance: 0.1 }
  },

  TIME_DILATION: {
    id: 'time_dilation',
    name: 'Time Dilation',
    description: 'Slow time by 30% for all enemies',
    type: 'utility',
    effects: { enemySlowdown: 0.3 }
  },

  WARP_DRIVE: {
    id: 'warp_drive',
    name: 'Warp Drive',
    description: 'Teleport forward 100px with cooldown',
    type: 'utility',
    effects: { warpDistance: 100, warpCooldown: 5000 }
  },

  // STATUS EFFECT ABILITIES (36-45)
  BURN_DAMAGE: {
    id: 'burn_damage',
    name: 'Solar Burn',
    description: 'Bullets burn enemies for 20 DPS over 3 seconds',
    type: 'status',
    effects: { burnDPS: 20, burnDuration: 3000 }
  },

  FREEZE_EFFECT: {
    id: 'freeze_effect',
    name: 'Cryogenic Freeze',
    description: 'Slow enemies by 40% for 2 seconds on hit',
    type: 'status',
    effects: { slowPercent: 0.4, slowDuration: 2000 }
  },

  POISON_CLOUD: {
    id: 'poison_cloud',
    name: 'Toxic Payload',
    description: 'Poison enemies for 30 damage over 5 seconds',
    type: 'status',
    effects: { poisonDamage: 30, poisonDuration: 5000 }
  },

  STUN_LOCK: {
    id: 'stun_lock',
    name: 'EMP Blast',
    description: '25% chance to stun enemies for 1 second',
    type: 'status',
    effects: { stunChance: 0.25, stunDuration: 1000 }
  },

  WEAKNESS_MARK: {
    id: 'weakness_mark',
    name: 'Mark of Weakness',
    description: 'Marked enemies take +25% damage from all sources',
    type: 'status',
    effects: { markDuration: 5000, markDamageBonus: 0.25 }
  },

  CORROSION: {
    id: 'corrosion',
    name: 'Corrosive Shells',
    description: 'Reduce enemy armor by 30% permanently',
    type: 'status',
    effects: { armorReduction: 0.3, permanent: true }
  },

  VAMPIRIC_CURSE: {
    id: 'vampiric_curse',
    name: 'Vampiric Curse',
    description: 'Cursed enemies heal you when they die',
    type: 'status',
    effects: { curseHeal: 15, curseDuration: 10000 }
  },

  CONFUSION: {
    id: 'confusion',
    name: 'Confusion Field',
    description: 'Enemies move erratically for 4 seconds',
    type: 'status',
    effects: { confuseDuration: 4000 }
  },

  RADIATION: {
    id: 'radiation',
    name: 'Radiation Leak',
    description: 'Irradiated enemies take 5 DPS and spread to nearby enemies',
    type: 'status',
    effects: { radiationDPS: 5, radiationSpread: 60 }
  },

  SHOCK_DAMAGE: {
    id: 'shock_damage',
    name: 'Electric Shock',
    description: 'Chain 10 damage to 3 nearby enemies on hit',
    type: 'status',
    effects: { shockDamage: 10, shockTargets: 3, shockRange: 80 }
  },

  // SURVIVAL ABILITIES (46-50 + more)
  LIFE_STEAL: {
    id: 'life_steal',
    name: 'Life Steal',
    description: 'Heal 10% of max health on enemy kill',
    type: 'survival',
    effects: { healPercent: 0.1 }
  },

  BERSERKER_MODE: {
    id: 'berserker',
    name: 'Berserker Rage',
    description: '+50% damage when below 30% health',
    type: 'survival',
    effects: { lowHealthThreshold: 0.3, lowHealthBonus: 0.5 }
  },

  LAST_STAND: {
    id: 'last_stand',
    name: 'Last Stand',
    description: 'Invincible for 3s when health reaches 1',
    type: 'survival',
    effects: { lastStandDuration: 3000, lastStandHealth: 1 }
  },

  PHOENIX_FURY: {
    id: 'phoenix_fury',
    name: 'Phoenix Fury',
    description: '+10% damage for 5s after each kill (stacks 5x)',
    type: 'survival',
    effects: { killBonus: 0.1, bonusDuration: 5000, maxStacks: 5 }
  },

  SECOND_WIND: {
    id: 'second_wind',
    name: 'Second Wind',
    description: 'Heal to 50% health when killing 10 enemies quickly',
    type: 'survival',
    effects: { killsRequired: 10, killWindow: 15000, healAmount: 0.5 }
  },

  BLOOD_RAGE: {
    id: 'blood_rage',
    name: 'Blood Rage',
    description: '+5% damage per enemy killed, resets on death',
    type: 'survival',
    effects: { damagePerKill: 0.05, maxStacks: 20 }
  },

  VENGEANCE: {
    id: 'vengeance',
    name: 'Vengeance',
    description: '+100% damage for 10s after losing a life',
    type: 'survival',
    effects: { vengeanceDamage: 1.0, vengeanceDuration: 10000 }
  },

  GRIT: {
    id: 'grit',
    name: 'Grit',
    description: 'Survive lethal damage once per life (1 HP)',
    type: 'survival',
    effects: { surviveLethal: true }
  },

  ADRENALINE_RUSH: {
    id: 'adrenaline_rush',
    name: 'Adrenaline Rush',
    description: '+30% speed when below 50% health',
    type: 'survival',
    effects: { lowHealthSpeed: 0.3, healthThreshold: 0.5 }
  },

  OVERHEAL: {
    id: 'overheal',
    name: 'Overheal',
    description: 'Healing can exceed max health up to 150%',
    type: 'survival',
    effects: { overhealMax: 1.5 }
  },

  // SPECIAL/UNIQUE ABILITIES (Continue to 50)
  INFINITY_GROWTH: {
    id: 'infinity_growth',
    name: 'Infinite Growth',
    description: '+1% damage and speed per kill (max 100%)',
    type: 'special',
    effects: { growthPerKill: 0.01, maxGrowth: 1.0 }
  },

  STELLAR_OVERLOAD: {
    id: 'stellar_overload',
    name: 'Stellar Overload',
    description: 'Activate all offensive abilities at once',
    type: 'special',
    effects: { multiAbility: true, allOffensive: true }
  },

  ROYAL_AUTHORITY: {
    id: 'royal_authority',
    name: 'Royal Authority',
    description: '+20% to ALL stats',
    type: 'special',
    effects: { allStatsBonus: 0.2 }
  },

  CHAOS_THEORY: {
    id: 'chaos_theory',
    name: 'Chaos Theory',
    description: 'Random ability activates every 10 seconds',
    type: 'special',
    effects: { randomAbility: true, abilityInterval: 10000 }
  },

  SYMBIOTIC_BOND: {
    id: 'symbiotic_bond',
    name: 'Symbiotic Bond',
    description: 'Share 20% of kills with nearby allies',
    type: 'special',
    effects: { shareKills: 0.2, shareRange: 200 }
  },

  GRAVITY_WELL: {
    id: 'gravity_well',
    name: 'Gravity Well',
    description: 'Pull enemies towards you (50px range)',
    type: 'special',
    effects: { gravityRange: 50, gravityStrength: 2 }
  },

  TEMPORAL_LOOP: {
    id: 'temporal_loop',
    name: 'Temporal Loop',
    description: 'Rewind 3 seconds when taking lethal damage',
    type: 'special',
    effects: { rewindDuration: 3000, rewindCooldown: 60000 }
  },

  CLONE_STRIKE: {
    id: 'clone_strike',
    name: 'Clone Strike',
    description: 'Spawn 2 clones that mimic your attacks',
    type: 'special',
    effects: { cloneCount: 2, cloneDamage: 0.5 }
  },

  BULLET_TIME: {
    id: 'bullet_time',
    name: 'Bullet Time',
    description: 'Slow all enemies to 20% speed for 5 seconds',
    type: 'special',
    effects: { slowPercent: 0.8, duration: 5000, cooldown: 30000 }
  },

  MULTI_STRIKE: {
    id: 'multi_strike',
    name: 'Multi-Strike',
    description: 'Hit same enemy 3 times instantly',
    type: 'special',
    effects: { multiHit: 3 }
  },

  ELEMENTAL_FURY: {
    id: 'elemental_fury',
    name: 'Elemental Fury',
    description: 'Rotate through fire/ice/lightning (5s each)',
    type: 'special',
    effects: { elementRotation: true, elementDuration: 5000 }
  },

  SNIPER_FOCUS: {
    id: 'sniper_focus',
    name: 'Sniper Focus',
    description: '+100% damage, but 50% slower fire rate',
    type: 'special',
    effects: { focusDamage: 1.0, focusFireRate: -0.5 }
  },

  GLASS_CANNON: {
    id: 'glass_cannon',
    name: 'Glass Cannon',
    description: '+150% damage, -50% max health',
    type: 'special',
    effects: { damageBonus: 1.5, healthPenalty: -0.5 }
  },

  SHIELD_BATTERY: {
    id: 'shield_battery',
    name: 'Shield Battery',
    description: 'Convert 50% damage to shield instead',
    type: 'special',
    effects: { damageToShield: 0.5 }
  },

  RICOCHET: {
    id: 'ricochet',
    name: 'Ricochet Rounds',
    description: 'Bullets bounce off walls 3 times',
    type: 'special',
    effects: { bounceCount: 3 }
  },

  DRONE_SWARM: {
    id: 'drone_swarm',
    name: 'Drone Swarm',
    description: 'Deploy 5 attack drones',
    type: 'special',
    effects: { droneCount: 5, droneDamage: 5, droneSpeed: 3 }
  },

  SPLIT_SHOT: {
    id: 'split_shot',
    name: 'Split Shot',
    description: 'Bullets split into 3 on first hit',
    type: 'special',
    effects: { splitCount: 3, splitDamage: 0.7 }
  },

  OVERLOAD: {
    id: 'overload',
    name: 'Weapons Overload',
    description: 'Fire all weapon types simultaneously',
    type: 'special',
    effects: { allWeapons: true }
  },

  PRECISION_TARGETING: {
    id: 'precision_targeting',
    name: 'Precision Targeting',
    description: 'Auto-aim at enemy weak points (+50% damage)',
    type: 'special',
    effects: { autoAim: true, weakPointBonus: 0.5 }
  },

  MOMENTUM: {
    id: 'momentum',
    name: 'Momentum',
    description: '+2% speed per second while moving (max 50%)',
    type: 'special',
    effects: { speedPerSecond: 0.02, maxSpeedBonus: 0.5 }
  },

  CHARGED_SHOTS: {
    id: 'charged_shots',
    name: 'Charged Shots',
    description: 'Hold fire to charge shot (3x damage at full charge)',
    type: 'special',
    effects: { chargeTime: 2000, chargeMultiplier: 3.0 }
  },

  AREA_DENIAL: {
    id: 'area_denial',
    name: 'Area Denial',
    description: 'Leave damaging zones that last 5 seconds',
    type: 'special',
    effects: { zoneDuration: 5000, zoneDPS: 15, zoneRadius: 50 }
  },

  PERFECT_ACCURACY: {
    id: 'perfect_accuracy',
    name: 'Perfect Accuracy',
    description: 'All shots guaranteed to hit nearest enemy',
    type: 'special',
    effects: { perfectAccuracy: true }
  },

  BULLET_HELL: {
    id: 'bullet_hell',
    name: 'Bullet Hell',
    description: 'Fire 20 bullets in all directions',
    type: 'special',
    effects: { omnidirectional: true, bulletCount: 20 }
  },

  ORBITAL_STRIKE: {
    id: 'orbital_strike',
    name: 'Orbital Strike',
    description: 'Call orbital laser every 30 seconds (500 damage)',
    type: 'special',
    effects: { orbitalDamage: 500, orbitalCooldown: 30000 }
  },

  SHIELD_BASH: {
    id: 'shield_bash',
    name: 'Shield Bash',
    description: 'Ram enemies with shield (100 damage, 5s cooldown)',
    type: 'special',
    effects: { ramDamage: 100, ramCooldown: 5000 }
  },

  MULTI_CLONE: {
    id: 'multi_clone',
    name: 'Multi-Clone',
    description: 'Create 4 clones that mirror your actions',
    type: 'special',
    effects: { cloneCount: 4, cloneDamage: 0.3 }
  },

  ULTIMATE_POWER: {
    id: 'ultimate_power',
    name: 'Ultimate Power',
    description: 'Combine 3 random abilities',
    type: 'special',
    effects: { randomAbilities: 3, multiAbility: true }
  },

  BERSERK_FUSION: {
    id: 'berserk_fusion',
    name: 'Berserk Fusion',
    description: 'All damage taken increases damage dealt by 10%',
    type: 'special',
    effects: { damagePerHit: 0.1, maxStacks: 10 }
  },

  QUANTUM_SUPERPOSITION: {
    id: 'quantum_super',
    name: 'Quantum Superposition',
    description: 'Exist in 2 locations simultaneously',
    type: 'special',
    effects: { dualPosition: true, positionOffset: 100 }
  }
};

// Get ability by ID
export const getAbility = (abilityId) => {
  return SHIP_ABILITIES[abilityId.toUpperCase()];
};

// Get abilities by type
export const getAbilitiesByType = (type) => {
  return Object.values(SHIP_ABILITIES).filter(ability => ability.type === type);
};

export default SHIP_ABILITIES;

