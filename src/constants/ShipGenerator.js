/**
 * Ship Generator - Creates 150 Unique Ships
 * Uses the 50 abilities to create diverse, balanced ships
 */

import { SHIP_ABILITIES } from './ShipAbilities.js';

// Ship name prefixes and suffixes for procedural generation
const SHIP_PREFIXES = [
  'Shadow', 'Void', 'Crimson', 'Thunder', 'Ice', 'Plasma', 'Nova', 'Quantum',
  'Solar', 'Toxic', 'Divine', 'Celestial', 'Chrono', 'Apocalypse', 'Omega',
  'Dragon', 'Infinity', 'Galactic', 'Supernova', 'Cosmic', 'Stellar', 'Nebula',
  'Aurora', 'Eclipse', 'Meteor', 'Comet', 'Astral', 'Ethereal', 'Phantom',
  'Spectral', 'Wraith', 'Spirit', 'Ghost', 'Demon', 'Angel', 'Titan',
  'Leviathan', 'Kraken', 'Phoenix', 'Hydra', 'Cerberus', 'Chimera',
  'Basilisk', 'Manticore', 'Sphinx', 'Minotaur', 'Cyclops', 'Golem',
  'Valkyrie', 'Odin', 'Thor', 'Loki', 'Freya', 'Artemis', 'Apollo',
  'Zeus', 'Hades', 'Poseidon', 'Athena', 'Ares', 'Hermes', 'Hephaestus'
];

const SHIP_SUFFIXES = [
  'Striker', 'Rage', 'Bolt', 'Breaker', 'Reaper', 'Bomber', 'Phantom',
  'Flare', 'Venom', 'Guardian', 'Annihilator', 'Monarch', 'Warper',
  'Rider', 'Prototype', 'Empress', 'Seeker', 'Titan', 'Prime', 'Hunter',
  'Defender', 'Dancer', 'Blade', 'Fang', 'Claw', 'Wing', 'Arrow',
  'Lance', 'Spear', 'Sword', 'Axe', 'Hammer', 'Scythe', 'Trident',
  'Sentinel', 'Vanguard', 'Tempest', 'Storm', 'Fury', 'Wrath', 'Doom',
  'Harbinger', 'Catalyst', 'Genesis', 'Exodus', 'Nemesis', 'Oracle',
  'Prophet', 'Martyr', 'Champion', 'Conqueror', 'Emperor', 'King'
];

// Color palettes for ships
const COLOR_PALETTES = [
  '#0088ff', '#ff0088', '#00ff88', '#ff8800', '#8800ff', '#ffff00',
  '#00ffff', '#ff00ff', '#ff0000', '#00ff00', '#0000ff', '#ffaa00',
  '#aa00ff', '#00aaff', '#ff00aa', '#aaff00', '#4a0e4e', '#cc0000',
  '#00ccff', '#ff6600', '#8844ff', '#ffaa00', '#00ff00', '#ffdd00',
  '#220022', '#9966ff', '#00aaff', '#ff0000', '#ffffff', '#ff4400',
  '#00ffff', '#4444ff', '#ff00ff', '#44ff44', '#ff4488', '#88ff44',
  '#4488ff', '#ff8888', '#88ffff', '#ffaa88', '#aa88ff', '#ff88aa'
];

/**
 * Generate 150 unique ships
 */
export const generateAllShips = () => {
  const ships = {};
  const abilities = Object.values(SHIP_ABILITIES);
  
  // Start with the 2 starter ships (already defined in ShipConstants.js)
  let shipIndex = 3; // Start from ship #3
  
  // Generate ships in tiers
  const tiers = [
    { name: 'Common', count: 40, costBase: 5000, statMultiplier: 1.0 },
    { name: 'Uncommon', count: 35, costBase: 15000, statMultiplier: 1.1 },
    { name: 'Rare', count: 30, costBase: 30000, statMultiplier: 1.2 },
    { name: 'Epic', count: 25, costBase: 50000, statMultiplier: 1.3 },
    { name: 'Legendary', count: 18, costBase: 80000, statMultiplier: 1.5 }
  ];
  
  tiers.forEach((tier, tierIndex) => {
    for (let i = 0; i < tier.count; i++) {
      const ship = generateShip(
        shipIndex,
        tier,
        abilities,
        tierIndex
      );
      
      ships[ship.key] = ship;
      shipIndex++;
      
      // Stop at 150 ships (2 starters + 148 generated)
      if (shipIndex > 150) break;
    }
  });
  
  return ships;
};

/**
 * Generate individual ship
 */
const generateShip = (index, tier, abilities, tierIndex) => {
  // Use index for deterministic generation
  const prefixIndex = (index * 7) % SHIP_PREFIXES.length;
  const suffixIndex = (index * 13) % SHIP_SUFFIXES.length;
  const colorIndex = (index * 17) % COLOR_PALETTES.length;
  const abilityIndex = (index * 3) % abilities.length;
  
  const prefix = SHIP_PREFIXES[prefixIndex];
  const suffix = SHIP_SUFFIXES[suffixIndex];
  const name = `${prefix} ${suffix}`;
  const id = `${prefix.toLowerCase()}${suffix}`;
  const key = id.toUpperCase().replace(/ /g, '_');
  
  // Generate balanced stats based on tier
  const baseSpeed = 4 + (seededRandom(index) * 5) * tier.statMultiplier;
  const baseHealth = 70 + (seededRandom(index + 100) * 60) * tier.statMultiplier;
  const baseDamage = 0.8 + (seededRandom(index + 200) * 0.8) * tier.statMultiplier;
  const baseFireRate = 0.7 + (seededRandom(index + 300) * 0.7) * tier.statMultiplier;
  
  // Select ability
  const ability = abilities[abilityIndex];
  
  // Calculate cost
  const cost = tier.costBase + (index * 500);
  
  // Determine unlock requirements
  const unlockReq = {
    score: cost * 2,
    level: 5 + tierIndex * 5,
    kills: 50 + (tierIndex * 100)
  };
  
  return {
    key: key,
    id: id,
    name: name,
    character: 'neutral',
    description: `${tier.name} tier ship with ${ability.name} ability.`,
    stats: {
      speed: Math.round(baseSpeed * 10) / 10,
      maxHealth: Math.round(baseHealth),
      damageMultiplier: Math.round(baseDamage * 100) / 100,
      fireRateMultiplier: Math.round(baseFireRate * 100) / 100,
      shieldCapacity: Math.round(baseHealth * 0.9)
    },
    special: {
      name: ability.name,
      description: ability.description,
      ...ability.effects
    },
    color: COLOR_PALETTES[colorIndex],
    cost: cost,
    unlocked: false,
    tier: tier.name,
    tierIndex: tierIndex,
    unlockRequirements: unlockReq
  };
};

/**
 * Seeded random for consistent generation
 */
const seededRandom = (seed) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

/**
 * Generate ship visuals for all 150 ships
 */
export const generateShipVisuals = (ships) => {
  const visuals = {};
  
  const shapes = [
    'triangle', 'arrow', 'heavy', 'dart', 'shield', 'stealth', 'aggressive',
    'lightning', 'scythe', 'bomber', 'ghost', 'star', 'venom', 'holy',
    'destroyer', 'royal', 'temporal', 'demon', 'prototype', 'dragon',
    'cosmic', 'titan', 'ultimate'
  ];
  
  Object.keys(ships).forEach((key, index) => {
    const ship = ships[key];
    const shapeIndex = index % shapes.length;
    
    visuals[ship.id] = {
      shape: shapes[shapeIndex],
      primaryColor: ship.color,
      secondaryColor: lightenColor(ship.color, 40),
      glowColor: ship.color,
      trailColor: ship.color
    };
  });
  
  return visuals;
};

/**
 * Lighten a hex color
 */
const lightenColor = (color, percent) => {
  const num = parseInt(color.replace("#",""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
  const B = Math.min(255, (num & 0x0000FF) + amt);
  return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
};

export default { generateAllShips, generateShipVisuals };

