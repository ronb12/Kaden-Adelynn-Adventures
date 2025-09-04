// Game Constants - Centralized configuration values
export const GAME_CONFIG = {
  // Canvas and Display
  MAX_CANVAS_WIDTH: 800,
  MAX_CANVAS_HEIGHT: 700,
  TARGET_FPS: 60,
  TARGET_FRAME_TIME: 1000 / 60, // 16.67ms per frame
  
  // Player Configuration
  PLAYER: {
    WIDTH: 40,
    HEIGHT: 40,
    SPEED: 5,
    MAX_HEALTH: 100,
    MAX_LIVES: 25,
    RESPAWN_INVINCIBILITY_TIME: 2000, // 2 seconds
  },
  
  // Weapon Configuration
  WEAPONS: {
    FIRE_RATE_MULTIPLIER: {
      RAPID_FIRE: 0.5,
      MOBILE_MIN: 120,
    },
    MULTI_SHOT_COUNT: 4,
    SPREAD_ANGLE_STEP: Math.PI / 12, // 15 degrees
  },
  
  // Enemy Configuration
  ENEMIES: {
    MAX_COUNT: {
      EASY: 8,
      MEDIUM: 10,
      HARD: 12,
    },
    BOSS_TRIGGER_SCORE: 1000,
    BOSS_HEALTH: 100,
  },
  
  // Spawn Timers (milliseconds)
  SPAWN_RATES: {
    POWER_UP: {
      EASY: 10000,
      MEDIUM: 8000,
      HARD: 12000,
    },
    EMOJI: {
      EASY: 2200,
      MEDIUM: 2500,
      HARD: 3500,
    },
    WEAPON: 12000,
    CAPSULE: 8000,
  },
  
  // Audio Configuration
  AUDIO: {
    VOLUME: {
      SHOOT: 0.05,
      EXPLOSION: 0.1,
      POWER_UP: 0.08,
      GAME_OVER: 0.15,
    },
    BACKGROUND_MUSIC: {
      LAYERS: [
        { frequency: 220, type: 'sine', volume: 0.02, detune: 0 },
        { frequency: 330, type: 'triangle', volume: 0.015, detune: 5 },
        { frequency: 440, type: 'sine', volume: 0.01, detune: -5 },
      ],
      MELODY_NOTES: [440, 494, 523, 587, 659, 698, 784, 880],
      MELODY_NOTE_DURATION: 0.5,
      MELODY_INTERVAL: 600,
    },
  },
  
  // Particle System
  PARTICLES: {
    EXPLOSION_COUNT: 5,
    COLLECTION_COUNT: 6,
    RESPAWN_COUNT: 15,
    MAX_LIFE: 40,
  },
  
  // UI Configuration
  UI: {
    ACHIEVEMENT_DISPLAY_TIME: 3000,
    COMBO_WINDOW: 2000, // 2 seconds
    MAX_COMBO_MULTIPLIER: 5,
  },
  
  // Performance
  PERFORMANCE: {
    STAR_COUNT: 30,
    MAX_ENEMY_BULLETS: 15,
    OBJECT_POOL_SIZES: {
      BULLETS: 50,
      PARTICLES: 100,
      ENEMIES: 20,
    },
  },
};

// Weapon Types Configuration
export const WEAPON_TYPES = {
  // Basic Energy Weapons (1-10)
  laser: { name: 'Laser', color: '#ffff00', damage: 10, speed: 8, size: [4, 10], fireRate: 150, spread: 0 },
  plasma: { name: 'Plasma', color: '#00ffff', damage: 12, speed: 7, size: [6, 12], fireRate: 180, spread: 0 },
  photon: { name: 'Photon', color: '#ff00ff', damage: 15, speed: 10, size: [3, 12], fireRate: 120, spread: 0 },
  ion: { name: 'Ion Beam', color: '#8800ff', damage: 8, speed: 12, size: [2, 15], fireRate: 100, spread: 0 },
  pulse: { name: 'Pulse', color: '#ff8800', damage: 14, speed: 6, size: [8, 8], fireRate: 200, spread: 0 },
  beam: { name: 'Energy Beam', color: '#ff00ff', damage: 20, speed: 10, size: [16, 20], fireRate: 300, spread: 0 },
  disruptor: { name: 'Disruptor', color: '#ff4400', damage: 18, speed: 9, size: [5, 14], fireRate: 160, spread: 0 },
  phaser: { name: 'Phaser', color: '#00ff88', damage: 16, speed: 11, size: [4, 16], fireRate: 140, spread: 0 },
  neutron: { name: 'Neutron', color: '#4488ff', damage: 22, speed: 7, size: [6, 18], fireRate: 250, spread: 0 },
  quantum: { name: 'Quantum', color: '#ff88ff', damage: 25, speed: 8, size: [7, 20], fireRate: 280, spread: 0 },
  
  // Projectile Weapons (11-20)
  missile: { name: 'Missile', color: '#ff4400', damage: 30, speed: 5, size: [8, 15], fireRate: 400, spread: 0 },
  rocket: { name: 'Rocket', color: '#ff6600', damage: 35, speed: 4, size: [10, 18], fireRate: 450, spread: 0 },
  torpedo: { name: 'Torpedo', color: '#ff2200', damage: 40, speed: 3, size: [12, 20], fireRate: 500, spread: 0 },
  grenade: { name: 'Grenade', color: '#88ff00', damage: 28, speed: 6, size: [6, 12], fireRate: 350, spread: 0 },
  bomb: { name: 'Bomb', color: '#ff0088', damage: 50, speed: 2, size: [15, 25], fireRate: 600, spread: 0 },
  mine: { name: 'Mine', color: '#ffaa00', damage: 45, speed: 1, size: [20, 20], fireRate: 800, spread: 0 },
  flak: { name: 'Flak', color: '#ff8844', damage: 20, speed: 7, size: [8, 12], fireRate: 200, spread: 15 },
  shell: { name: 'Shell', color: '#ffcc00', damage: 32, speed: 6, size: [9, 16], fireRate: 380, spread: 0 },
  cannon: { name: 'Cannon', color: '#ff6644', damage: 38, speed: 5, size: [12, 22], fireRate: 420, spread: 0 },
  mortar: { name: 'Mortar', color: '#aa4400', damage: 42, speed: 4, size: [14, 18], fireRate: 480, spread: 0 },
  
  // Spread Weapons (21-30)
  spread: { name: 'Spread', color: '#ffff00', damage: 8, speed: 8, size: [4, 10], fireRate: 200, spread: 3 },
  shotgun: { name: 'Shotgun', color: '#ff4488', damage: 6, speed: 9, size: [3, 8], fireRate: 250, spread: 5 },
  scatter: { name: 'Scatter', color: '#88ff44', damage: 7, speed: 10, size: [2, 6], fireRate: 180, spread: 7 },
  burst: { name: 'Burst', color: '#4488ff', damage: 9, speed: 8, size: [4, 8], fireRate: 120, spread: 4 },
  spray: { name: 'Spray', color: '#ff8888', damage: 5, speed: 12, size: [2, 5], fireRate: 80, spread: 8 },
  fan: { name: 'Fan', color: '#88ffff', damage: 10, speed: 7, size: [3, 9], fireRate: 160, spread: 6 },
  arc: { name: 'Arc', color: '#ffaa88', damage: 12, speed: 6, size: [5, 12], fireRate: 220, spread: 4 },
  wave: { name: 'Wave', color: '#aa88ff', damage: 11, speed: 9, size: [4, 11], fireRate: 190, spread: 5 },
  cone: { name: 'Cone', color: '#ff88aa', damage: 8, speed: 11, size: [3, 7], fireRate: 140, spread: 9 },
  radial: { name: 'Radial', color: '#88aaff', damage: 6, speed: 8, size: [2, 6], fireRate: 100, spread: 12 },
  
  // Special Weapons (31-40)
  homing: { name: 'Homing', color: '#00ff00', damage: 18, speed: 4, size: [6, 12], fireRate: 300, spread: 0 },
  seeking: { name: 'Seeking', color: '#44ff44', damage: 20, speed: 3, size: [5, 14], fireRate: 350, spread: 0 },
  tracking: { name: 'Tracking', color: '#88ff88', damage: 22, speed: 5, size: [4, 16], fireRate: 280, spread: 0 },
  guided: { name: 'Guided', color: '#00ff88', damage: 24, speed: 6, size: [7, 18], fireRate: 320, spread: 0 },
  smart: { name: 'Smart', color: '#44ffaa', damage: 26, speed: 4, size: [6, 20], fireRate: 380, spread: 0 },
  chain: { name: 'Chain', color: '#ffff88', damage: 15, speed: 8, size: [3, 12], fireRate: 200, spread: 0 },
  lightning: { name: 'Lightning', color: '#8888ff', damage: 28, speed: 15, size: [2, 25], fireRate: 250, spread: 0 },
  electric: { name: 'Electric', color: '#aaaaff', damage: 24, speed: 12, size: [3, 20], fireRate: 220, spread: 0 },
  magnetic: { name: 'Magnetic', color: '#ff44ff', damage: 20, speed: 7, size: [5, 15], fireRate: 280, spread: 0 },
  gravity: { name: 'Gravity', color: '#8844ff', damage: 32, speed: 3, size: [8, 8], fireRate: 400, spread: 0 },
  
  // Exotic Weapons (41-50)
  antimatter: { name: 'Antimatter', color: '#ffffff', damage: 60, speed: 2, size: [10, 30], fireRate: 800, spread: 0 },
  dark: { name: 'Dark Energy', color: '#440044', damage: 45, speed: 6, size: [6, 25], fireRate: 500, spread: 0 },
  void: { name: 'Void', color: '#220022', damage: 55, speed: 4, size: [8, 28], fireRate: 600, spread: 0 },
  cosmic: { name: 'Cosmic', color: '#4444aa', damage: 50, speed: 5, size: [9, 24], fireRate: 550, spread: 0 },
  stellar: { name: 'Stellar', color: '#ffaa44', damage: 48, speed: 7, size: [7, 22], fireRate: 480, spread: 0 },
  nova: { name: 'Nova', color: '#ffcc88', damage: 65, speed: 3, size: [12, 35], fireRate: 900, spread: 0 },
  singularity: { name: 'Singularity', color: '#000088', damage: 80, speed: 1, size: [15, 40], fireRate: 1200, spread: 0 },
  warp: { name: 'Warp', color: '#8800aa', damage: 35, speed: 15, size: [4, 18], fireRate: 300, spread: 0 },
  temporal: { name: 'Temporal', color: '#aa0088', damage: 40, speed: 8, size: [6, 20], fireRate: 400, spread: 0 },
  dimensional: { name: 'Dimensional', color: '#0088aa', damage: 42, speed: 9, size: [5, 22], fireRate: 350, spread: 0 },
  
  // Bonus Weapons (51-55)
  rainbow: { name: 'Rainbow', color: '#ff0088', damage: 25, speed: 10, size: [5, 15], fireRate: 150, spread: 2 },
  prism: { name: 'Prism', color: '#88ff00', damage: 30, speed: 8, size: [6, 18], fireRate: 200, spread: 3 },
  crystal: { name: 'Crystal', color: '#00ff88', damage: 35, speed: 6, size: [8, 20], fireRate: 250, spread: 0 },
  diamond: { name: 'Diamond', color: '#ffffff', damage: 45, speed: 4, size: [10, 25], fireRate: 400, spread: 0 },
  ultimate: { name: 'Ultimate', color: '#ff00ff', damage: 100, speed: 12, size: [8, 30], fireRate: 100, spread: 1 }
};

// Difficulty Settings
export const DIFFICULTY_SETTINGS = {
  easy: {
    enemySpeedMultiplier: 0.8,
    enemySpawnRate: 2200,
    powerUpSpawnRate: 10000,
    emojiSpawnRate: 2200,
    enemyShootRate: 2800,
    playerSpeed: 6
  },
  medium: {
    enemySpeedMultiplier: 1.2,
    enemySpawnRate: 1500,
    powerUpSpawnRate: 8000,
    emojiSpawnRate: 2500,
    enemyShootRate: 1700,
    playerSpeed: 5
  },
  hard: {
    enemySpeedMultiplier: 1.8,
    enemySpawnRate: 1000,
    powerUpSpawnRate: 12000,
    emojiSpawnRate: 3500,
    enemyShootRate: 800,
    playerSpeed: 4
  }
};

// Enemy Types Configuration
export const ENEMY_TYPES = {
  normal: { color: '#ff0000', speedMultiplier: 1, sizeMultiplier: 1 },
  fast: { color: '#ff6600', speedMultiplier: 2.5, sizeMultiplier: 0.83 },
  strong: { color: '#cc0000', speedMultiplier: 0.8, sizeMultiplier: 1.33 },
  zigzag: { color: '#ff00ff', speedMultiplier: 1.5, sizeMultiplier: 0.93 },
  kamikaze: { color: '#ffff00', speedMultiplier: 3, sizeMultiplier: 0.73 },
  shooter: { color: '#00ff00', speedMultiplier: 1, sizeMultiplier: 1.07 },
  boss: { color: '#ff00ff', speedMultiplier: 1, sizeMultiplier: 2.5 }
};

// Power-up Types
export const POWER_UP_TYPES = {
  multiShot: { color: '#ff00ff', symbol: '⚡' },
  rapidFire: { color: '#ffff00', symbol: '🔥' },
  shield: { color: '#00ffff', symbol: '🛡️' },
  speed: { color: '#ff8800', symbol: '💨' },
  weapon: { color: '#ff00ff', symbol: '🔫' },
  life: { color: '#ffd700', symbol: '👤' }
};

// Key Bindings
export const KEY_BINDINGS = {
  MOVEMENT: {
    LEFT: ['ArrowLeft', 'a', 'A'],
    RIGHT: ['ArrowRight', 'd', 'D'],
    UP: ['ArrowUp', 'w', 'W'],
    DOWN: ['ArrowDown', 's', 'S']
  },
  ACTIONS: {
    SHOOT: [' ', 'Spacebar'],
    PAUSE: ['p', 'P'],
    WEAPONS: {
      LASER: '1',
      PLASMA: '2',
      MISSILE: '3',
      BEAM: '4',
      SPREAD: '5',
      HOMING: '6'
    }
  }
};

// Achievement Definitions
export const ACHIEVEMENTS = {
  FIRST_DEATH: { id: 'first_death', title: 'Lost a Life', description: 'Your first death in the game!' },
  GAME_OVER: { id: 'game_over', title: 'Game Over', description: 'Used all 25 lives!' },
  HIGH_SCORER: { id: 'high_scorer', title: 'High Scorer', description: 'Scored over 1000 points!' },
  BOSS_DEFEATED: { id: 'boss_defeated', title: 'Boss Slayer', description: 'Defeated your first boss!' },
  SCORE_1000: { id: 'score_1000', title: 'Score Master', description: 'Reached 1000 points!' },
  SCORE_5000: { id: 'score_5000', title: 'High Scorer', description: 'Reached 5000 points!' },
  EXTRA_LIFE: { id: 'extra_life', title: 'Extra Life', description: 'Collected an extra life power-up!' }
};

// Daily Challenges
export const DAILY_CHALLENGES = [
  { id: 'kills_50', name: 'Exterminator', description: 'Kill 50 enemies in one session', target: 50, type: 'kills' },
  { id: 'survive_300', name: 'Survivor', description: 'Survive for 5 minutes', target: 300, type: 'time' },
  { id: 'combo_15', name: 'Combo Master', description: 'Achieve a 15x combo', target: 15, type: 'combo' },
  { id: 'score_5000', name: 'High Scorer', description: 'Score 5000 points in one game', target: 5000, type: 'score' }
];
