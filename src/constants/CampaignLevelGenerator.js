/**
 * Campaign Level Generator - Creates 300 EPIC Levels
 * THE LARGEST campaign mode in ALL mobile gaming!
 */

const LEVEL_THEMES = [
  'First Contact', 'Speed Trial', 'Weapon Mastery', 'Power Surge', 'Defense Line',
  'Strike Force', 'Rapid Assault', 'Heavy Resistance', 'Stealth Mission', 'Bombardment',
  'Survival Test', 'Accuracy Challenge', 'Boss Rush', 'Asteroid Field', 'Nebula Crossing',
  'Time Attack', 'Perfect Run', 'Elite Squadron', 'Drone Swarm', 'Bullet Hell',
  'Shield Test', 'Evasion Course', 'Hunter Mission', 'Rescue Op', 'Sabotage',
  'Infiltration', 'Extraction', 'Demolition', 'Escort Duty', 'Siege',
  'Ambush', 'Counter-Attack', 'Fortress Assault', 'Fleet Battle', 'Last Stand',
  'Gauntlet Run', 'Chaos Mode', 'Precision Strike', 'Heavy Metal', 'Lightning War',
  'Void Incursion', 'Warp Jump', 'Quantum Leap', 'Black Hole', 'Supernova',
  'Galaxy Defense', 'Star Forge', 'Celestial War', 'Cosmic Rift', 'Infinity Edge',
  'Temporal Paradox', 'Reality Breach', 'Dimension Shift', 'Nexus Battle', 'Final Frontier',
  'Ultimate Challenge', 'Apocalypse', 'Armageddon', 'Ragnarok', 'Exodus',
  'Genesis Protocol', 'Omega Directive', 'Alpha Strike', 'Beta Squadron', 'Gamma Burst',
  'Delta Force', 'Epsilon Wave', 'Zeta Assault', 'Eta Defense', 'Theta Protocol'
];

const BOSS_TYPES_CAMPAIGN = [
  'Scout Commander', 'Void Cruiser', 'Assault Carrier', 'Dreadnought',
  'Temporal Destroyer', 'Chaos Lord', 'Shadow Emperor', 'Void Tyrant',
  'Galactic Destroyer', 'Omega Titan', 'Void Emperor', 'Dimensional Overlord',
  'Cosmic Horror', 'Star Devourer', 'Reality Breaker', 'Infinity Eater',
  'Time Weaver', 'Chaos Incarnate', 'Void Sovereign', 'Ultimate Destroyer',
  'Primordial Entity', 'Ancient One', 'Void God', 'Chaos Titan', 'Death Star',
  'Oblivion Lord', 'Entropy King', 'Singularity Beast', 'Quantum Nightmare', 'Final Boss'
];

/**
 * Generate 300 campaign levels
 */
export const generate300Levels = () => {
  const levels = {};
  
  for (let i = 1; i <= 300; i++) {
    levels[`LEVEL_${i}`] = generateLevel(i);
  }
  
  return levels;
};

// Backward compatibility
export const generate200Levels = () => {
  const levels = {};
  for (let i = 1; i <= 200; i++) {
    levels[`LEVEL_${i}`] = generateLevel(i);
  }
  return levels;
};

/**
 * Generate individual level
 */
const generateLevel = (levelNum) => {
  const difficulty = getDifficulty(levelNum);
  const isBossLevel = levelNum % 10 === 0; // Boss every 10 levels
  const isMiniBoss = levelNum % 5 === 0 && !isBossLevel; // Mini-boss every 5 levels
  
  const themeIndex = (levelNum * 7) % LEVEL_THEMES.length;
  const theme = LEVEL_THEMES[themeIndex];
  
  const level = {
    id: levelNum,
    name: `Mission ${levelNum}: ${theme}`,
    description: generateDescription(levelNum, isBossLevel, isMiniBoss),
    difficulty: difficulty.name,
    objectives: generateObjectives(levelNum, isBossLevel, isMiniBoss),
    enemyWaves: generateWaves(levelNum, difficulty, isBossLevel),
    powerUps: generatePowerUps(levelNum),
    rewards: generateRewards(levelNum, isBossLevel),
    unlockRequirement: levelNum === 1 ? null : {
      level: levelNum - 1,
      stars: Math.min(3, 1 + Math.floor(levelNum / 50))
    }
  };
  
  // Add boss or hazards
  if (isBossLevel) {
    level.boss = generateBoss(levelNum);
  } else if (isMiniBoss) {
    level.miniBoss = generateMiniBoss(levelNum);
  } else if (levelNum % 7 === 0) {
    level.hazards = generateHazards(levelNum);
  }
  
  return level;
};

/**
 * Get difficulty tier based on level number
 */
const getDifficulty = (levelNum) => {
  if (levelNum <= 20) return { name: 'tutorial', multiplier: 0.7 };
  if (levelNum <= 50) return { name: 'easy', multiplier: 1.0 };
  if (levelNum <= 100) return { name: 'medium', multiplier: 1.3 };
  if (levelNum <= 150) return { name: 'hard', multiplier: 1.6 };
  if (levelNum <= 200) return { name: 'extreme', multiplier: 2.0 };
  if (levelNum <= 250) return { name: 'nightmare', multiplier: 2.5 };
  return { name: 'impossible', multiplier: 3.0 };
};

/**
 * Generate level description
 */
const generateDescription = (levelNum, isBossLevel, isMiniBoss) => {
  if (isBossLevel) {
    const bossNum = Math.floor(levelNum / 10);
    return `Face the mighty ${BOSS_TYPES_CAMPAIGN[bossNum % BOSS_TYPES_CAMPAIGN.length]}!`;
  }
  if (isMiniBoss) {
    return 'Defeat the mini-boss and its escorts.';
  }
  
  const descriptions = [
    'Complete wave-based combat objectives.',
    'Survive intense enemy assault.',
    'Test your skills in combat.',
    'Prove your worth as a pilot.',
    'Face escalating difficulty.',
    'Master advanced combat techniques.'
  ];
  
  return descriptions[levelNum % descriptions.length];
};

/**
 * Generate objectives
 */
const generateObjectives = (levelNum, isBossLevel, isMiniBoss) => {
  const objectives = {
    primary: null,
    bonus: []
  };
  
  if (isBossLevel) {
    objectives.primary = { type: 'defeat_boss', target: 1 };
    objectives.bonus = [
      { type: 'perfect_boss', reward: 'starRating', value: 2 },
      { type: 'time_limit', target: 90 + levelNum, reward: 'starRating', value: 1 }
    ];
  } else if (isMiniBoss) {
    objectives.primary = { type: 'defeat_mini_boss', target: 1 };
    objectives.bonus = [
      { type: 'no_damage', reward: 'starRating', value: 1 },
      { type: 'time_limit', target: 60, reward: 'starRating', value: 1 }
    ];
  } else {
    const objectiveTypes = ['kill_enemies', 'survive_time', 'accuracy', 'combo_streak'];
    const primaryType = objectiveTypes[levelNum % objectiveTypes.length];
    
    objectives.primary = {
      type: primaryType,
      target: getObjectiveTarget(primaryType, levelNum)
    };
    
    objectives.bonus = [
      { type: 'health_above', target: 0.5, reward: 'starRating', value: 1 },
      { type: 'kill_enemies', target: 20 + levelNum * 2, reward: 'starRating', value: 1 }
    ];
  }
  
  return objectives;
};

/**
 * Get objective target based on level
 */
const getObjectiveTarget = (type, levelNum) => {
  const baseTargets = {
    'kill_enemies': 15 + levelNum * 2,
    'survive_time': 60 + levelNum * 3,
    'accuracy': 0.5 + (levelNum * 0.002),
    'combo_streak': 5 + Math.floor(levelNum / 5)
  };
  
  return baseTargets[type] || 10;
};

/**
 * Generate enemy waves
 */
const generateWaves = (levelNum, difficulty, isBossLevel) => {
  const waveCount = Math.min(10, 3 + Math.floor(levelNum / 10));
  const waves = [];
  
  const enemyTypes = ['normal', 'fast', 'strong', 'zigzag', 'kamikaze', 'shooter', 'elite'];
  
  for (let i = 0; i < waveCount; i++) {
    const typeIndex = (levelNum + i) % enemyTypes.length;
    const enemyType = enemyTypes[typeIndex];
    
    waves.push({
      wave: i + 1,
      count: Math.min(20, 5 + Math.floor(levelNum / 5) + i),
      type: enemyType,
      delay: isBossLevel ? 15000 + (i * 10000) : 2000 + (i * 2000),
      repeat: levelNum > 100 && !isBossLevel
    });
  }
  
  return waves;
};

/**
 * Generate boss
 */
const generateBoss = (levelNum) => {
  const bossIndex = Math.floor(levelNum / 10);
  const bossType = BOSS_TYPES_CAMPAIGN[bossIndex % BOSS_TYPES_CAMPAIGN.length];
  
  return {
    type: bossType.toLowerCase().replace(/ /g, '_'),
    health: 1000 + (levelNum * 100),
    phases: Math.min(6, 2 + Math.floor(levelNum / 20)),
    special: levelNum > 100 ? 'all_abilities' : levelNum > 50 ? 'enhanced' : 'basic'
  };
};

/**
 * Generate mini-boss
 */
const generateMiniBoss = (levelNum) => {
  return {
    type: 'mini_boss',
    health: 500 + (levelNum * 30),
    escorts: 5 + Math.floor(levelNum / 10)
  };
};

/**
 * Generate hazards
 */
const generateHazards = (levelNum) => {
  const hazardTypes = ['asteroids', 'mines', 'laser_gates', 'black_holes', 'solar_flares'];
  const hazardIndex = Math.floor(levelNum / 7) % hazardTypes.length;
  
  return [hazardTypes[hazardIndex]];
};

/**
 * Generate power-ups for level
 */
const generatePowerUps = (levelNum) => {
  if (levelNum <= 10) {
    return ['health', 'shield'];
  } else if (levelNum <= 50) {
    return ['health', 'shield', 'multiShot', 'rapidFire'];
  } else if (levelNum <= 100) {
    return ['health', 'shield', 'multiShot', 'rapidFire', 'speed', 'weapon'];
  } else {
    return ['all'];
  }
};

/**
 * Generate rewards
 */
const generateRewards = (levelNum, isBossLevel) => {
  const baseXP = 100 + (levelNum * 25);
  const baseCredits = 50 + (levelNum * 15);
  
  const rewards = {
    xp: isBossLevel ? baseXP * 5 : baseXP,
    credits: isBossLevel ? baseCredits * 4 : baseCredits
  };
  
  // Ship unlocks every 10 levels
  if (levelNum % 10 === 0) {
    rewards.unlock = `ship_${Math.floor(levelNum / 10)}`;
  }
  
  // Special titles at milestones
  if (levelNum === 50) rewards.title = 'Elite Pilot';
  if (levelNum === 100) rewards.title = 'Ace Commander';
  if (levelNum === 150) rewards.title = 'Legendary Hero';
  if (levelNum === 200) rewards.title = 'Void Slayer Supreme';
  if (levelNum === 250) rewards.title = 'Cosmic Dominator';
  if (levelNum === 300) rewards.title = 'God of War';
  
  return rewards;
};

export default generate300Levels;

