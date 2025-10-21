/**
 * Background Preset Generator
 * Creates 150 unique background presets
 * Most diverse background system in mobile gaming!
 */

export const BACKGROUND_THEMES = {
  // Space Regions (10 base themes) - REDUCED darkness for mobile visibility
  VOID_SPACE: { darkness: 0.4, stars: 20, nebulae: 0, planets: 0, asteroids: 0, color: '#001155' },
  STAR_CLUSTER: { darkness: 0.2, stars: 150, nebulae: 1, planets: 1, asteroids: 0, color: '#002266' },
  NEBULA_FIELD: { darkness: 0.3, stars: 40, nebulae: 5, planets: 2, asteroids: 0, color: '#330055' },
  ASTEROID_BELT: { darkness: 0.4, stars: 30, nebulae: 0, planets: 1, asteroids: 50, color: '#443322' },
  PLANETARY_SYSTEM: { darkness: 0.2, stars: 50, nebulae: 1, planets: 5, asteroids: 10, color: '#223355' },
  COSMIC_DUST: { darkness: 0.5, stars: 80, nebulae: 3, planets: 2, asteroids: 5, color: '#221133' },
  WARP_TUNNEL: { darkness: 0.7, stars: 100, nebulae: 2, planets: 0, asteroids: 0, color: '#330066', animated: true },
  SUPERNOVA_REMNANT: { darkness: 0.3, stars: 60, nebulae: 8, planets: 0, asteroids: 20, color: '#442200' },
  BLACK_HOLE_VICINITY: { darkness: 0.95, stars: 10, nebulae: 1, planets: 0, asteroids: 0, color: '#000000', distortion: true },
  BINARY_STAR_SYSTEM: { darkness: 0.2, stars: 90, nebulae: 2, planets: 4, asteroids: 0, color: '#443311' },
  
  // Nebula Types (8 nebula themes)
  PURPLE_NEBULA: { darkness: 0.5, stars: 40, nebulae: 4, planets: 2, asteroids: 0, color: '#4a0e4e', nebulaColor: 'purple' },
  BLUE_NEBULA: { darkness: 0.4, stars: 50, nebulae: 4, planets: 2, asteroids: 0, color: '#0e1a4e', nebulaColor: 'blue' },
  GREEN_NEBULA: { darkness: 0.5, stars: 45, nebulae: 4, planets: 1, asteroids: 0, color: '#0e4e1a', nebulaColor: 'green' },
  RED_NEBULA: { darkness: 0.6, stars: 35, nebulae: 5, planets: 1, asteroids: 0, color: '#4e0e0e', nebulaColor: 'red' },
  ORANGE_NEBULA: { darkness: 0.5, stars: 40, nebulae: 4, planets: 2, asteroids: 0, color: '#4e2a0e', nebulaColor: 'orange' },
  CYAN_NEBULA: { darkness: 0.4, stars: 55, nebulae: 3, planets: 3, asteroids: 0, color: '#0e4e4e', nebulaColor: 'cyan' },
  YELLOW_NEBULA: { darkness: 0.3, stars: 60, nebulae: 3, planets: 3, asteroids: 0, color: '#4e4e0e', nebulaColor: 'yellow' },
  PINK_NEBULA: { darkness: 0.5, stars: 45, nebulae: 4, planets: 2, asteroids: 0, color: '#4e0e2a', nebulaColor: 'pink' },
  
  // Boss Arenas (8 dramatic themes)
  VOID_EMPEROR_THRONE: { darkness: 0.95, stars: 5, nebulae: 1, planets: 0, asteroids: 0, color: '#0a0000', lightning: true },
  CHAOS_DIMENSION: { darkness: 0.8, stars: 30, nebulae: 6, planets: 0, asteroids: 0, color: '#2a0a2a', chaotic: true },
  TEMPORAL_RIFT: { darkness: 0.7, stars: 100, nebulae: 3, planets: 2, asteroids: 0, color: '#0a2a4a', timeDistortion: true },
  SHADOW_REALM: { darkness: 0.98, stars: 3, nebulae: 0, planets: 0, asteroids: 0, color: '#000000', shadows: true },
  STAR_FORGE: { darkness: 0.2, stars: 200, nebulae: 2, planets: 0, asteroids: 0, color: '#4a3a0a', forge: true },
  VOID_NEXUS: { darkness: 0.9, stars: 15, nebulae: 2, planets: 0, asteroids: 0, color: '#1a001a', vortex: true },
  COSMIC_BATTLEFIELD: { darkness: 0.6, stars: 70, nebulae: 3, planets: 3, asteroids: 0, color: '#2a1a1a', debris: true },
  REALITY_BREACH: { darkness: 0.85, stars: 40, nebulae: 4, planets: 1, asteroids: 0, color: '#1a0a2a', glitch: true },
  
  // Special Zones (10 unique themes)
  WORMHOLE_EXIT: { darkness: 0.7, stars: 80, nebulae: 3, planets: 1, asteroids: 0, color: '#1a1a3a', spiral: true },
  QUANTUM_SPACE: { darkness: 0.5, stars: 120, nebulae: 4, planets: 2, asteroids: 0, color: '#2a2a4a', quantum: true },
  HYPERSPACE_LANE: { darkness: 0.6, stars: 200, nebulae: 1, planets: 0, asteroids: 0, color: '#0a0a3a', streaks: true },
  GRAVITY_ANOMALY: { darkness: 0.8, stars: 60, nebulae: 2, planets: 4, asteroids: 0, color: '#2a1a0a', warped: true },
  PLASMA_STORM: { darkness: 0.4, stars: 40, nebulae: 6, planets: 0, asteroids: 0, color: '#3a1a4a', lightning: true },
  ION_CLOUD: { darkness: 0.5, stars: 50, nebulae: 5, planets: 1, asteroids: 0, color: '#1a3a3a', electric: true },
  DARK_MATTER_ZONE: { darkness: 0.92, stars: 20, nebulae: 1, planets: 0, asteroids: 0, color: '#0a0a0a', darkMatter: true },
  STELLAR_NURSERY: { darkness: 0.3, stars: 100, nebulae: 10, planets: 5, asteroids: 0, color: '#2a2a1a', birthStars: true },
  METEOR_SHOWER: { darkness: 0.6, stars: 70, nebulae: 2, planets: 2, asteroids: 40, color: '#2a1a2a', meteors: true },
  PULSAR_ZONE: { darkness: 0.8, stars: 90, nebulae: 3, planets: 1, asteroids: 0, color: '#1a2a1a', pulsing: true }
};

/**
 * Helper: Shift color hue
 */
const shiftColor = (color, amount) => {
  try {
    const hex = color.replace('#', '');
    let r = parseInt(hex.substr(0, 2), 16);
    let g = parseInt(hex.substr(2, 2), 16);
    let b = parseInt(hex.substr(4, 2), 16);
    
    r = Math.max(0, Math.min(255, r + amount));
    g = Math.max(0, Math.min(255, g + amount));
    b = Math.max(0, Math.min(255, b + amount));
    
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    return color;
  }
};

/**
 * Helper: Pick random special effects
 */
const pickRandomSpecialEffects = () => {
  const effects = {};
  const possibilities = ['animated', 'lightning', 'vortex', 'quantum', 'glitch', 'streaks'];
  
  if (Math.random() > 0.7) {
    effects[possibilities[Math.floor(Math.random() * possibilities.length)]] = true;
  }
  
  return effects;
};

/**
 * Helper: Darken color
 */
const darkenColor = (color, amount) => {
  try {
    const hex = color.replace('#', '');
    let r = parseInt(hex.substr(0, 2), 16);
    let g = parseInt(hex.substr(2, 2), 16);
    let b = parseInt(hex.substr(4, 2), 16);
    
    r = Math.max(0, r - amount);
    g = Math.max(0, g - amount);
    b = Math.max(0, b - amount);
    
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    return color;
  }
};

/**
 * Generate 150 background presets procedurally
 */
const generate150PresetsInternal = () => {
  const presets = {};
  
  // Add all themed presets (60 from above)
  Object.keys(BACKGROUND_THEMES).forEach((key, index) => {
    presets[`PRESET_${index + 1}`] = {
      id: index + 1,
      name: key.toLowerCase().replace(/_/g, ' '),
      ...BACKGROUND_THEMES[key]
    };
  });
  
  // Generate 114 more procedural variations (150 total - 36 base themes = 114)
  const baseThemes = Object.values(BACKGROUND_THEMES);
  for (let i = 36; i < 150; i++) {
    const baseTheme = baseThemes[i % baseThemes.length];
    const variation = (i - 36) % 3; // 0, 1, 2
    
    presets[`PRESET_${i + 1}`] = {
      id: i + 1,
      name: `space region ${i + 1}`,
      darkness: Math.min(0.95, (baseTheme.darkness || 0.5) + (variation * 0.1)),
      stars: Math.floor((baseTheme.stars || 50) * (1 + variation * 0.3)),
      nebulae: (baseTheme.nebulae || 0) + variation,
      planets: (baseTheme.planets || 0) + Math.floor(variation / 2),
      asteroids: (baseTheme.asteroids || 0) + (variation * 5),
      color: shiftColor(baseTheme.color || '#000033', variation * 20),
      ...pickRandomSpecialEffects()
    };
  }
  
  return presets;
};

// Cache the presets - generate once at module load time
const CACHED_PRESETS = generate150PresetsInternal();

/**
 * Generate 150 background presets (exported for testing)
 */
export const generate150Presets = () => CACHED_PRESETS;

/**
 * Get background for specific campaign level
 */
export const getBackgroundForLevel = (levelNum) => {
  const presets = CACHED_PRESETS;
  
  // Boss levels (every 10) - dramatic dark backgrounds
  if (levelNum % 10 === 0) {
    return getBossBackground(Math.floor(levelNum / 10));
  }
  
  // Mini-boss levels (every 5) - intense backgrounds
  if (levelNum % 5 === 0) {
    return getMiniBossBackground(Math.floor(levelNum / 5));
  }
  
  // Hazard levels (every 7) - themed backgrounds
  if (levelNum % 7 === 0) {
    return getHazardBackground(levelNum);
  }
  
  // Regular levels - cycle through all 150 presets
  const presetIndex = ((levelNum - 1) % 150) + 1; // Ensure 1-150 range
  const preset = presets[`PRESET_${presetIndex}`];
  
  // Safety check and clone to prevent mutation
  if (!preset) {
    console.error(`⚠️ Preset not found for index ${presetIndex}, using fallback`);
    return { 
      darkness: 0.5, 
      stars: 50, 
      nebulae: 2, 
      planets: 1, 
      asteroids: 0, 
      color: '#000033',
      name: 'Fallback Space'
    };
  }
  
  return { ...preset }; // Clone to prevent mutation
};

/**
 * Boss-specific backgrounds (dark and dramatic)
 */
const getBossBackground = (bossNumber) => {
  // REDUCED darkness for mobile visibility (was 0.85-0.99, now 0.4-0.6)
  const bossBgs = [
    { darkness: 0.5, stars: 5, nebulae: 1, planets: 0, asteroids: 0, color: '#330000', lightning: true, name: 'Void Emperor Throne' },
    { darkness: 0.45, stars: 10, nebulae: 2, planets: 0, asteroids: 0, color: '#001a33', vortex: true, name: 'Chaos Dimension' },
    { darkness: 0.5, stars: 8, nebulae: 1, planets: 1, asteroids: 0, color: '#1a0033', timeDistortion: true, name: 'Temporal Rift' },
    { darkness: 0.6, stars: 3, nebulae: 0, planets: 0, asteroids: 0, color: '#110011', shadows: true, name: 'Shadow Realm' },
    { darkness: 0.4, stars: 15, nebulae: 3, planets: 0, asteroids: 0, color: '#331a00', forge: true, name: 'Star Forge' },
    { darkness: 0.5, stars: 12, nebulae: 2, planets: 0, asteroids: 0, color: '#330033', vortex: true, name: 'Void Nexus' },
    { darkness: 0.4, stars: 20, nebulae: 4, planets: 2, asteroids: 0, color: '#3a2a2a', debris: true, name: 'Cosmic Battlefield' },
    { darkness: 0.55, stars: 6, nebulae: 3, planets: 0, asteroids: 0, color: '#2a1a2a', glitch: true, name: 'Reality Breach' },
    { darkness: 0.5, stars: 10, nebulae: 2, planets: 1, asteroids: 0, color: '#1a1a2a', quantum: true, name: 'Quantum Void' },
    { darkness: 0.6, stars: 2, nebulae: 1, planets: 0, asteroids: 0, color: '#110011', apocalypse: true, name: 'Apocalypse Dimension' }
  ];
  
  const bg = { ...bossBgs[bossNumber % bossBgs.length] }; // Clone to avoid mutation
  bg.id = `boss_${bossNumber}`;
  return bg;
};

/**
 * Mini-boss backgrounds (intense but not as dark as bosses)
 */
const getMiniBossBackground = (miniBossNumber) => {
  return {
    darkness: 0.7 + (miniBossNumber % 10) * 0.02,
    stars: 40 - (miniBossNumber % 10) * 2,
    nebulae: 3 + (miniBossNumber % 3),
    planets: 2,
    asteroids: 10,
    color: shiftColor('#1a1a2a', miniBossNumber * 5),
    intense: true,
    name: `Combat Zone ${miniBossNumber}`
  };
};

/**
 * Hazard-specific backgrounds
 */
const getHazardBackground = (levelNum) => {
  const hazardTypes = [
    { darkness: 0.6, stars: 30, nebulae: 0, planets: 1, asteroids: 80, color: '#332211', name: 'Asteroid Belt' },
    { darkness: 0.7, stars: 40, nebulae: 1, planets: 0, asteroids: 5, color: '#2a1a1a', debris: true, name: 'Minefield' },
    { darkness: 0.5, stars: 50, nebulae: 4, planets: 2, asteroids: 0, color: '#1a2a3a', lasers: true, name: 'Laser Gates' },
    { darkness: 0.95, stars: 10, nebulae: 1, planets: 0, asteroids: 0, color: '#000000', blackHole: true, name: 'Black Hole' },
    { darkness: 0.2, stars: 60, nebulae: 6, planets: 1, asteroids: 0, color: '#4a3a0a', solarFlares: true, name: 'Solar Flares' }
  ];
  
  const hazard = hazardTypes[Math.floor(levelNum / 7) % hazardTypes.length];
  return { ...hazard }; // Clone to prevent mutation
};

/**
 * Get progressive difficulty background
 */
export const getProgressiveBackground = (levelNum) => {
  const difficulty = getDifficultyTier(levelNum);
  
  // Darkness increases with difficulty
  const basePreset = getBackgroundForLevel(levelNum);
  
  // Clone the preset to avoid mutating the cached object
  const progressivePreset = { ...basePreset };
  
  // MINIMAL darkness for mobile visibility (max 0.3 instead of 0.95)
  const maxDarkness = 0.3; // Very light!
  progressivePreset.darkness = Math.min(maxDarkness, (progressivePreset.darkness || 0.1) + (difficulty.tier * 0.02));
  progressivePreset.color = darkenColor(progressivePreset.color || '#001144', difficulty.tier * 10);
  progressivePreset.intensity = 1.0 + (difficulty.tier * 0.2);
  
  return progressivePreset;
};

const getDifficultyTier = (levelNum) => {
  if (levelNum <= 20) return { tier: 0, name: 'tutorial' };
  if (levelNum <= 50) return { tier: 1, name: 'easy' };
  if (levelNum <= 100) return { tier: 2, name: 'medium' };
  if (levelNum <= 150) return { tier: 3, name: 'hard' };
  if (levelNum <= 200) return { tier: 4, name: 'extreme' };
  if (levelNum <= 250) return { tier: 5, name: 'nightmare' };
  return { tier: 6, name: 'impossible' };
};

export default { generate150Presets, getBackgroundForLevel, getProgressiveBackground };

