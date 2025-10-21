/**
 * Campaign Mode Constants - 300 EPIC Levels with Objectives
 * THE LARGEST campaign mode in ALL mobile gaming!
 */

import { generate300Levels } from './CampaignLevelGenerator.js';

export const CAMPAIGN_LEVELS = {
  // Tutorial Levels (1-5)
  LEVEL_1: {
    id: 1,
    name: 'First Contact',
    description: 'Learn the basics. Destroy 10 enemies.',
    difficulty: 'tutorial',
    objectives: {
      primary: { type: 'kill_enemies', target: 10 },
      bonus: [
        { type: 'no_damage', reward: 'starRating', value: 1 },
        { type: 'time_limit', target: 60, reward: 'starRating', value: 1 }
      ]
    },
    enemyWaves: [
      { wave: 1, count: 3, type: 'normal', delay: 2000 },
      { wave: 2, count: 4, type: 'normal', delay: 5000 },
      { wave: 3, count: 3, type: 'normal', delay: 8000 }
    ],
    powerUps: ['health', 'score'],
    rewards: { xp: 100, credits: 50 },
    unlockRequirement: null
  },

  LEVEL_2: {
    id: 2,
    name: 'Speed Trial',
    description: 'Face faster enemies. Survive 2 minutes.',
    difficulty: 'easy',
    objectives: {
      primary: { type: 'survive_time', target: 120 },
      bonus: [
        { type: 'kill_enemies', target: 15, reward: 'starRating', value: 1 },
        { type: 'combo_streak', target: 5, reward: 'starRating', value: 1 }
      ]
    },
    enemyWaves: [
      { wave: 1, count: 3, type: 'fast', delay: 1000 },
      { wave: 2, count: 4, type: 'fast', delay: 3000 },
      { wave: 3, count: 5, type: 'fast', delay: 6000 },
      { wave: 4, count: 3, type: 'normal', delay: 9000 }
    ],
    powerUps: ['speed', 'rapidFire'],
    rewards: { xp: 150, credits: 75 },
    unlockRequirement: { level: 1, stars: 1 }
  },

  LEVEL_3: {
    id: 3,
    name: 'Weapon Mastery',
    description: 'Use 3 different weapons to defeat enemies.',
    difficulty: 'easy',
    objectives: {
      primary: { type: 'use_weapons', target: 3 },
      bonus: [
        { type: 'kill_enemies', target: 20, reward: 'starRating', value: 1 },
        { type: 'accuracy', target: 0.7, reward: 'starRating', value: 1 }
      ]
    },
    enemyWaves: [
      { wave: 1, count: 5, type: 'normal', delay: 2000 },
      { wave: 2, count: 5, type: 'zigzag', delay: 5000 },
      { wave: 3, count: 5, type: 'normal', delay: 8000 }
    ],
    powerUps: ['laser', 'plasma', 'missile'],
    rewards: { xp: 200, credits: 100 },
    unlockRequirement: { level: 2, stars: 1 }
  },

  LEVEL_4: {
    id: 4,
    name: 'Power Surge',
    description: 'Collect 5 power-ups and defeat 25 enemies.',
    difficulty: 'easy',
    objectives: {
      primary: { type: 'collect_powerups', target: 5 },
      bonus: [
        { type: 'kill_enemies', target: 25, reward: 'starRating', value: 1 },
        { type: 'health_above', target: 0.5, reward: 'starRating', value: 1 }
      ]
    },
    enemyWaves: [
      { wave: 1, count: 6, type: 'normal', delay: 2000 },
      { wave: 2, count: 6, type: 'fast', delay: 4000 },
      { wave: 3, count: 7, type: 'zigzag', delay: 7000 }
    ],
    powerUps: ['multiShot', 'shield', 'rapidFire', 'speed', 'health'],
    rewards: { xp: 250, credits: 125 },
    unlockRequirement: { level: 3, stars: 2 }
  },

  LEVEL_5: {
    id: 5,
    name: 'Mini Boss: Scout Commander',
    description: 'Defeat the Scout Commander and 10 escorts.',
    difficulty: 'easy',
    objectives: {
      primary: { type: 'defeat_boss', target: 1 },
      bonus: [
        { type: 'time_limit', target: 90, reward: 'starRating', value: 1 },
        { type: 'no_deaths', reward: 'starRating', value: 1 }
      ]
    },
    boss: { type: 'scout_commander', health: 500, phase: 1 },
    enemyWaves: [
      { wave: 1, count: 5, type: 'normal', delay: 1000 },
      { wave: 2, count: 5, type: 'fast', delay: 30000 }
    ],
    powerUps: ['health', 'shield', 'multiShot'],
    rewards: { xp: 500, credits: 250, unlock: 'ship_shadowStriker' },
    unlockRequirement: { level: 4, stars: 2 }
  },

  // Intermediate Levels (6-25)
  LEVEL_10: {
    id: 10,
    name: 'Asteroid Field',
    description: 'Navigate through asteroids while fighting enemies.',
    difficulty: 'medium',
    objectives: {
      primary: { type: 'survive_time', target: 180 },
      bonus: [
        { type: 'kill_enemies', target: 40, reward: 'starRating', value: 1 },
        { type: 'avoid_obstacles', target: 20, reward: 'starRating', value: 1 }
      ]
    },
    hazards: ['asteroids'],
    enemyWaves: [
      { wave: 1, count: 8, type: 'zigzag', delay: 2000 },
      { wave: 2, count: 8, type: 'fast', delay: 5000 },
      { wave: 3, count: 10, type: 'normal', delay: 8000 }
    ],
    powerUps: ['shield', 'speed', 'multiShot'],
    rewards: { xp: 600, credits: 300 },
    unlockRequirement: { level: 9, stars: 2 }
  },

  LEVEL_15: {
    id: 15,
    name: 'Boss: Void Cruiser',
    description: 'Defeat the powerful Void Cruiser.',
    difficulty: 'medium',
    objectives: {
      primary: { type: 'defeat_boss', target: 1 },
      bonus: [
        { type: 'perfect_boss', reward: 'starRating', value: 2 },
        { type: 'time_limit', target: 120, reward: 'starRating', value: 1 }
      ]
    },
    boss: { type: 'void_cruiser', health: 2000, phases: 3 },
    enemyWaves: [
      { wave: 1, count: 10, type: 'normal', delay: 10000 },
      { wave: 2, count: 10, type: 'shooter', delay: 40000 }
    ],
    powerUps: ['health', 'shield', 'multiShot', 'rapidFire'],
    rewards: { xp: 1000, credits: 500, unlock: 'ship_novaBomber' },
    unlockRequirement: { level: 14, stars: 3 }
  },

  LEVEL_20: {
    id: 20,
    name: 'Kamikaze Assault',
    description: 'Survive waves of kamikaze enemies.',
    difficulty: 'hard',
    objectives: {
      primary: { type: 'survive_time', target: 180 },
      bonus: [
        { type: 'kill_enemies', target: 50, reward: 'starRating', value: 1 },
        { type: 'health_above', target: 0.6, reward: 'starRating', value: 1 }
      ]
    },
    enemyWaves: [
      { wave: 1, count: 15, type: 'kamikaze', delay: 2000 },
      { wave: 2, count: 20, type: 'kamikaze', delay: 5000 },
      { wave: 3, count: 15, type: 'strong', delay: 8000 }
    ],
    powerUps: ['shield', 'health', 'multiShot', 'rapidFire'],
    rewards: { xp: 1200, credits: 600 },
    unlockRequirement: { level: 19, stars: 2 }
  },

  LEVEL_25: {
    id: 25,
    name: 'Boss: Void Annihilator',
    description: 'Face the fearsome Void Annihilator.',
    difficulty: 'hard',
    objectives: {
      primary: { type: 'defeat_boss', target: 1 },
      bonus: [
        { type: 'perfect_boss', reward: 'starRating', value: 2 },
        { type: 'no_continues', reward: 'starRating', value: 1 }
      ]
    },
    boss: { type: 'void_annihilator', health: 4000, phases: 4 },
    enemyWaves: [
      { wave: 1, count: 12, type: 'shooter', delay: 15000 },
      { wave: 2, count: 12, type: 'strong', delay: 45000 }
    ],
    powerUps: ['health', 'shield', 'multiShot', 'rapidFire', 'weapon'],
    rewards: { xp: 2000, credits: 1000, unlock: 'ship_voidAnnihilator' },
    unlockRequirement: { level: 24, stars: 3 }
  },

  // Advanced Levels (26-40)
  LEVEL_30: {
    id: 30,
    name: 'Survival Marathon',
    description: 'Survive 5 minutes of escalating difficulty.',
    difficulty: 'hard',
    objectives: {
      primary: { type: 'survive_time', target: 300 },
      bonus: [
        { type: 'kill_enemies', target: 100, reward: 'starRating', value: 1 },
        { type: 'combo_master', target: 20, reward: 'starRating', value: 1 }
      ]
    },
    enemyWaves: [
      { wave: 1, count: 10, type: 'normal', delay: 2000, repeat: true },
      { wave: 2, count: 8, type: 'fast', delay: 4000, repeat: true },
      { wave: 3, count: 6, type: 'strong', delay: 6000, repeat: true },
      { wave: 4, count: 10, type: 'shooter', delay: 8000, repeat: true }
    ],
    powerUps: ['all'],
    rewards: { xp: 2500, credits: 1250 },
    unlockRequirement: { level: 29, stars: 3 }
  },

  LEVEL_35: {
    id: 35,
    name: 'Boss: Temporal Destroyer',
    description: 'Defeat the time-bending Temporal Destroyer.',
    difficulty: 'hard',
    objectives: {
      primary: { type: 'defeat_boss', target: 1 },
      bonus: [
        { type: 'perfect_boss', reward: 'starRating', value: 2 },
        { type: 'speed_kill', target: 90, reward: 'starRating', value: 1 }
      ]
    },
    boss: { type: 'temporal_destroyer', health: 6000, phases: 5, special: 'time_slow' },
    enemyWaves: [
      { wave: 1, count: 15, type: 'zigzag', delay: 20000 },
      { wave: 2, count: 15, type: 'shooter', delay: 60000 }
    ],
    powerUps: ['health', 'shield', 'multiShot', 'rapidFire', 'weapon'],
    rewards: { xp: 3000, credits: 1500, unlock: 'ship_chronoWarper' },
    unlockRequirement: { level: 34, stars: 3 }
  },

  LEVEL_40: {
    id: 40,
    name: 'Gauntlet of Champions',
    description: 'Face 3 mini-bosses in succession.',
    difficulty: 'extreme',
    objectives: {
      primary: { type: 'defeat_bosses', target: 3 },
      bonus: [
        { type: 'perfect_run', reward: 'starRating', value: 2 },
        { type: 'time_limit', target: 180, reward: 'starRating', value: 1 }
      ]
    },
    bosses: [
      { type: 'scout_commander', health: 2000 },
      { type: 'void_cruiser', health: 3000 },
      { type: 'assault_carrier', health: 4000 }
    ],
    powerUps: ['health', 'shield'],
    rewards: { xp: 4000, credits: 2000, unlock: 'ship_celestialMonarch' },
    unlockRequirement: { level: 39, stars: 3 }
  },

  // Expert Levels (41-50)
  LEVEL_45: {
    id: 45,
    name: 'Bullet Hell',
    description: 'Survive intense enemy fire. Dodge 500 bullets.',
    difficulty: 'extreme',
    objectives: {
      primary: { type: 'dodge_bullets', target: 500 },
      bonus: [
        { type: 'survive_time', target: 240, reward: 'starRating', value: 1 },
        { type: 'kill_enemies', target: 75, reward: 'starRating', value: 1 }
      ]
    },
    enemyWaves: [
      { wave: 1, count: 20, type: 'shooter', delay: 1000, repeat: true },
      { wave: 2, count: 15, type: 'strong', delay: 3000, repeat: true }
    ],
    powerUps: ['shield', 'speed', 'health'],
    rewards: { xp: 4500, credits: 2250 },
    unlockRequirement: { level: 44, stars: 3 }
  },

  LEVEL_50: {
    id: 50,
    name: 'Final Boss: Void Emperor',
    description: 'The ultimate challenge. Defeat the Void Emperor.',
    difficulty: 'extreme',
    objectives: {
      primary: { type: 'defeat_boss', target: 1 },
      bonus: [
        { type: 'perfect_boss', reward: 'starRating', value: 3 },
        { type: 'flawless_victory', reward: 'ship_supernovaPrime' }
      ]
    },
    boss: { type: 'void_emperor', health: 10000, phases: 6, special: 'all_abilities' },
    enemyWaves: [
      { wave: 1, count: 20, type: 'elite', delay: 30000, repeat: true }
    ],
    powerUps: ['all'],
    rewards: { xp: 10000, credits: 5000, unlock: 'ship_supernovaPrime', title: 'Void Slayer' },
    unlockRequirement: { level: 49, stars: 3 }
  }
};

// Generate remaining levels (6-9, 11-14, 16-19, 21-24, 26-29, 31-34, 36-39, 41-44, 46-49)
const generateIntermediateLevels = () => {
  const generatedLevels = {};
  
  // Levels 6-9
  for (let i = 6; i <= 9; i++) {
    generatedLevels[`LEVEL_${i}`] = {
      id: i,
      name: `Mission ${i}: ${['Strike Force', 'Defense Line', 'Rapid Assault', 'Heavy Resistance'][i - 6]}`,
      description: `Complete wave-based combat objectives.`,
      difficulty: 'easy',
      objectives: {
        primary: { type: 'kill_enemies', target: 20 + (i * 5) },
        bonus: [
          { type: 'combo_streak', target: 5 + i, reward: 'starRating', value: 1 },
          { type: 'time_limit', target: 120 - (i * 5), reward: 'starRating', value: 1 }
        ]
      },
      enemyWaves: Array(4).fill(null).map((_, waveIndex) => ({
        wave: waveIndex + 1,
        count: 5 + i,
        type: ['normal', 'fast', 'zigzag', 'strong'][waveIndex % 4],
        delay: 2000 + (waveIndex * 2000)
      })),
      powerUps: ['health', 'shield', 'multiShot', 'rapidFire'],
      rewards: { xp: 300 + (i * 50), credits: 150 + (i * 25) },
      unlockRequirement: { level: i - 1, stars: 2 }
    };
  }

  // Levels 11-14, 16-19, 21-24 (Medium difficulty)
  [11, 12, 13, 14, 16, 17, 18, 19, 21, 22, 23, 24].forEach(i => {
    generatedLevels[`LEVEL_${i}`] = {
      id: i,
      name: `Mission ${i}: Combat Zone`,
      description: `Advanced combat scenario.`,
      difficulty: 'medium',
      objectives: {
        primary: { type: 'kill_enemies', target: 30 + (i * 2) },
        bonus: [
          { type: 'accuracy', target: 0.6 + (i * 0.01), reward: 'starRating', value: 1 },
          { type: 'health_above', target: 0.5, reward: 'starRating', value: 1 }
        ]
      },
      enemyWaves: Array(5).fill(null).map((_, waveIndex) => ({
        wave: waveIndex + 1,
        count: 6 + Math.floor(i / 3),
        type: ['normal', 'fast', 'zigzag', 'strong', 'shooter'][waveIndex % 5],
        delay: 2000 + (waveIndex * 2000)
      })),
      powerUps: ['all'],
      rewards: { xp: 700 + (i * 30), credits: 350 + (i * 15) },
      unlockRequirement: { level: i - 1, stars: 2 }
    };
  });

  // Levels 26-29, 31-34, 36-39, 41-44, 46-49 (Hard/Extreme difficulty)
  [26, 27, 28, 29, 31, 32, 33, 34, 36, 37, 38, 39, 41, 42, 43, 44, 46, 47, 48, 49].forEach(i => {
    generatedLevels[`LEVEL_${i}`] = {
      id: i,
      name: `Mission ${i}: Elite Operations`,
      description: `High-difficulty combat mission.`,
      difficulty: i >= 41 ? 'extreme' : 'hard',
      objectives: {
        primary: { type: 'kill_enemies', target: 50 + (i * 2) },
        bonus: [
          { type: 'combo_master', target: 15 + Math.floor(i / 5), reward: 'starRating', value: 1 },
          { type: 'survive_time', target: 180 + (i * 2), reward: 'starRating', value: 1 }
        ]
      },
      enemyWaves: Array(6).fill(null).map((_, waveIndex) => ({
        wave: waveIndex + 1,
        count: 8 + Math.floor(i / 5),
        type: ['fast', 'strong', 'zigzag', 'shooter', 'kamikaze', 'elite'][waveIndex % 6],
        delay: 1500 + (waveIndex * 2000)
      })),
      powerUps: ['all'],
      rewards: { xp: 2000 + (i * 50), credits: 1000 + (i * 25) },
      unlockRequirement: { level: i - 1, stars: 3 }
    };
  });

  return generatedLevels;
};

// Generate 300 levels
const generated300Levels = generate300Levels();

// Merge all levels (keeping original 10 key levels for story, adding 290 more procedural)
export const ALL_CAMPAIGN_LEVELS = {
  ...CAMPAIGN_LEVELS,
  ...generateIntermediateLevels(),
  ...generated300Levels
};

// Export total level count
export const TOTAL_CAMPAIGN_LEVELS = Object.keys(ALL_CAMPAIGN_LEVELS).length;

console.log(`🚀 Campaign loaded: ${TOTAL_CAMPAIGN_LEVELS} EPIC levels!`);

// Campaign progression tracking
export const CAMPAIGN_PROGRESSION = {
  currentLevel: 1,
  completedLevels: [],
  starRatings: {}, // { levelId: stars }
  totalStars: 0,
  unlockedShips: []
};

// Objective types
export const OBJECTIVE_TYPES = {
  KILL_ENEMIES: 'kill_enemies',
  SURVIVE_TIME: 'survive_time',
  DEFEAT_BOSS: 'defeat_boss',
  COLLECT_POWERUPS: 'collect_powerups',
  USE_WEAPONS: 'use_weapons',
  ACCURACY: 'accuracy',
  COMBO_STREAK: 'combo_streak',
  NO_DAMAGE: 'no_damage',
  HEALTH_ABOVE: 'health_above',
  DODGE_BULLETS: 'dodge_bullets',
  PERFECT_BOSS: 'perfect_boss',
  FLAWLESS_VICTORY: 'flawless_victory'
};

// Star rating thresholds
export const STAR_THRESHOLDS = {
  ONE_STAR: { primary: true },
  TWO_STARS: { primary: true, bonus: 1 },
  THREE_STARS: { primary: true, bonus: 2 }
};

