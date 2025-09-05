// Boss Types - Additional boss encounters for 100% completion
export const BOSS_TYPES = {
  // Chapter 1 Boss - Void Scout Commander
  VOID_SCOUT_COMMANDER: {
    id: 'void_scout_commander',
    name: 'Void Scout Commander',
    health: 150,
    maxHealth: 150,
    width: 80,
    height: 60,
    speed: 2,
    color: '#ff4444',
    phase: 1,
    maxPhase: 3,
    attackPattern: 'zigzag_shoot',
    specialAbilities: ['rapid_fire', 'shield_burst'],
    unlockScore: 1000,
    description: 'A veteran Void Empire commander with advanced tactics'
  },
  
  // Chapter 2 Boss - Shadow Fleet Admiral
  SHADOW_FLEET_ADMIRAL: {
    id: 'shadow_fleet_admiral',
    name: 'Shadow Fleet Admiral',
    health: 250,
    maxHealth: 250,
    width: 100,
    height: 80,
    speed: 1.5,
    color: '#8b00ff',
    phase: 1,
    maxPhase: 4,
    attackPattern: 'spiral_attack',
    specialAbilities: ['teleport', 'summon_drones', 'energy_wave'],
    unlockScore: 5000,
    description: 'Commands the Shadow Fleet with ancient AI technology'
  },
  
  // Chapter 3 Boss - Void Emperor
  VOID_EMPEROR: {
    id: 'void_emperor',
    name: 'Void Emperor',
    health: 500,
    maxHealth: 500,
    width: 120,
    height: 100,
    speed: 1,
    color: '#000000',
    phase: 1,
    maxPhase: 5,
    attackPattern: 'chaos_attack',
    specialAbilities: ['phase_shift', 'dark_matter_blast', 'reality_warp', 'summon_army'],
    unlockScore: 10000,
    description: 'The ancient ruler of the Void Empire, a living ship of pure darkness'
  },
  
  // Special Boss - Federation Traitor
  FEDERATION_TRAITOR: {
    id: 'federation_traitor',
    name: 'Federation Traitor',
    health: 200,
    maxHealth: 200,
    width: 90,
    height: 70,
    speed: 2.5,
    color: '#ffff00',
    phase: 1,
    maxPhase: 3,
    attackPattern: 'federation_tactics',
    specialAbilities: ['federation_weapons', 'stealth_mode', 'counter_attack'],
    unlockScore: 7500,
    description: 'A former Federation officer who defected to the Void Empire'
  },
  
  // Secret Boss - Ancient Guardian
  ANCIENT_GUARDIAN: {
    id: 'ancient_guardian',
    name: 'Ancient Guardian',
    health: 1000,
    maxHealth: 1000,
    width: 150,
    height: 120,
    speed: 0.8,
    color: '#00ffff',
    phase: 1,
    maxPhase: 6,
    attackPattern: 'guardian_protocol',
    specialAbilities: ['time_slow', 'barrier_creation', 'energy_absorption', 'final_judgment'],
    unlockScore: 15000,
    description: 'An ancient AI guardian protecting the galaxy\'s deepest secrets'
  }
};

// Boss Attack Patterns
export const BOSS_ATTACK_PATTERNS = {
  zigzag_shoot: {
    name: 'Zigzag Shoot',
    description: 'Moves in zigzag pattern while firing rapid shots',
    bulletCount: 3,
    bulletSpeed: 4,
    fireRate: 300,
    movementPattern: 'zigzag'
  },
  
  spiral_attack: {
    name: 'Spiral Attack',
    description: 'Fires bullets in spiral pattern while teleporting',
    bulletCount: 8,
    bulletSpeed: 3,
    fireRate: 500,
    movementPattern: 'spiral'
  },
  
  chaos_attack: {
    name: 'Chaos Attack',
    description: 'Unpredictable attacks with reality-warping abilities',
    bulletCount: 12,
    bulletSpeed: 5,
    fireRate: 200,
    movementPattern: 'chaos'
  },
  
  federation_tactics: {
    name: 'Federation Tactics',
    description: 'Uses advanced Federation combat techniques',
    bulletCount: 5,
    bulletSpeed: 4.5,
    fireRate: 400,
    movementPattern: 'tactical'
  },
  
  guardian_protocol: {
    name: 'Guardian Protocol',
    description: 'Ancient defensive and offensive protocols',
    bulletCount: 15,
    bulletSpeed: 3.5,
    fireRate: 150,
    movementPattern: 'guardian'
  }
};

// Boss Special Abilities
export const BOSS_SPECIAL_ABILITIES = {
  rapid_fire: {
    name: 'Rapid Fire',
    description: 'Increases fire rate significantly',
    duration: 3000,
    effect: 'fireRate * 0.3'
  },
  
  shield_burst: {
    name: 'Shield Burst',
    description: 'Creates expanding shield that damages nearby enemies',
    duration: 2000,
    effect: 'area_damage'
  },
  
  teleport: {
    name: 'Teleport',
    description: 'Instantly moves to random location',
    duration: 1000,
    effect: 'teleport'
  },
  
  summon_drones: {
    name: 'Summon Drones',
    description: 'Spawns 3-5 attack drones',
    duration: 5000,
    effect: 'spawn_drones'
  },
  
  energy_wave: {
    name: 'Energy Wave',
    description: 'Sends powerful energy wave across screen',
    duration: 1500,
    effect: 'wave_attack'
  },
  
  phase_shift: {
    name: 'Phase Shift',
    description: 'Becomes temporarily invulnerable and faster',
    duration: 4000,
    effect: 'invulnerable + speed * 2'
  },
  
  dark_matter_blast: {
    name: 'Dark Matter Blast',
    description: 'Fires concentrated dark matter projectile',
    duration: 2000,
    effect: 'dark_matter_projectile'
  },
  
  reality_warp: {
    name: 'Reality Warp',
    description: 'Bends space-time to create impossible attacks',
    duration: 3000,
    effect: 'reality_warp'
  },
  
  summon_army: {
    name: 'Summon Army',
    description: 'Spawns multiple enemy ships',
    duration: 6000,
    effect: 'spawn_army'
  },
  
  federation_weapons: {
    name: 'Federation Weapons',
    description: 'Uses advanced Federation weaponry',
    duration: 4000,
    effect: 'federation_weapons'
  },
  
  stealth_mode: {
    name: 'Stealth Mode',
    description: 'Becomes invisible and moves faster',
    duration: 3000,
    effect: 'invisible + speed * 1.5'
  },
  
  counter_attack: {
    name: 'Counter Attack',
    description: 'Reflects incoming projectiles',
    duration: 2000,
    effect: 'reflect_projectiles'
  },
  
  time_slow: {
    name: 'Time Slow',
    description: 'Slows down time for all other objects',
    duration: 5000,
    effect: 'time_slow'
  },
  
  barrier_creation: {
    name: 'Barrier Creation',
    description: 'Creates protective barriers',
    duration: 4000,
    effect: 'create_barriers'
  },
  
  energy_absorption: {
    name: 'Energy Absorption',
    description: 'Absorbs energy to heal and power up',
    duration: 3000,
    effect: 'absorb_energy'
  },
  
  final_judgment: {
    name: 'Final Judgment',
    description: 'Ultimate attack with massive damage',
    duration: 1000,
    effect: 'ultimate_attack'
  }
};

// Boss Phase Transitions
export const BOSS_PHASE_TRANSITIONS = {
  1: {
    healthThreshold: 0.8,
    newAbilities: [],
    visualChange: 'glow_intensify',
    message: 'Boss is getting serious!'
  },
  2: {
    healthThreshold: 0.6,
    newAbilities: ['rapid_fire'],
    visualChange: 'color_shift',
    message: 'Boss enters phase 2!'
  },
  3: {
    healthThreshold: 0.4,
    newAbilities: ['shield_burst'],
    visualChange: 'size_increase',
    message: 'Boss is enraged!'
  },
  4: {
    healthThreshold: 0.2,
    newAbilities: ['teleport'],
    visualChange: 'particle_effects',
    message: 'Boss is desperate!'
  },
  5: {
    healthThreshold: 0.1,
    newAbilities: ['final_judgment'],
    visualChange: 'ultimate_form',
    message: 'Boss unleashes ultimate power!'
  }
};
