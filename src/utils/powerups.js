// Enhanced Power-up system with 60 collectibles (30 power-ups + 30 weapons)
export const powerUpTypes = {
  // POWER-UPS (30 types)
  health: {
    name: 'Health Boost',
    color: '#4ecdc4',
    icon: '❤️',
    effect: 'restoreHealth',
    duration: 0,
  },
  shield: { name: 'Shield', color: '#00ffff', icon: '🛡️', effect: 'addShield', duration: 10000 },
  rapidFire: {
    name: 'Rapid Fire',
    color: '#ff6b6b',
    icon: '⚡',
    effect: 'rapidFire',
    duration: 15000,
  },
  multiShot: {
    name: 'Multi Shot',
    color: '#ffd700',
    icon: '🎯',
    effect: 'multiShot',
    duration: 20000,
  },
  slowMotion: {
    name: 'Slow Motion',
    color: '#9b59b6',
    icon: '⏰',
    effect: 'slowMotion',
    duration: 8000,
  },
  missilePack: {
    name: 'Missile Pack',
    color: '#e74c3c',
    icon: '🚀',
    effect: 'missiles',
    duration: 30000,
  },
  speedBoost: {
    name: 'Speed Boost',
    color: '#3498db',
    icon: '💨',
    effect: 'speedBoost',
    duration: 12000,
  },
  coinDoubler: {
    name: 'Score Doubler',
    color: '#2ecc71',
    icon: '💰',
    effect: 'coinDoubler',
    duration: 25000,
  },
  life: { name: 'Extra Life', color: '#ff1493', icon: '💖', effect: 'addLife', duration: 0 },
  healthMax: {
    name: 'Max Health',
    color: '#ff0080',
    icon: '❤️‍🔥',
    effect: 'restoreFullHealth',
    duration: 0,
  },
  invulnerability: {
    name: 'Invulnerability',
    color: '#ff00ff',
    icon: '✨',
    effect: 'invulnerability',
    duration: 5000,
  },
  slowEnemies: {
    name: 'Slow Enemies',
    color: '#9370db',
    icon: '🧊',
    effect: 'slowEnemies',
    duration: 10000,
  },
  magnet: { name: 'Magnet', color: '#ff6347', icon: '🧲', effect: 'magnet', duration: 15000 },
  freeze: { name: 'Freeze', color: '#00bfff', icon: '🧊', effect: 'freeze', duration: 8000 },
  omega: {
    name: 'Omega Blast',
    color: '#ff0080',
    icon: '💥',
    effect: 'omegaBlast',
    duration: 12000,
  },
  mines: { name: 'Mines', color: '#ff8c00', icon: '💣', effect: 'deployMines', duration: 20000 },
  drone: { name: 'Drone', color: '#32cd32', icon: '🤖', effect: 'activateDrone', duration: 30000 },
  nuke: { name: 'Nuke', color: '#ff0000', icon: '☢️', effect: 'nuke', duration: 0 },
  rockets: { name: 'Rockets', color: '#ffa500', icon: '🔥', effect: 'rockets', duration: 25000 },
  burst: { name: 'Burst Fire', color: '#9932cc', icon: '💫', effect: 'burstFire', duration: 20000 },
  piercing: {
    name: 'Piercing Shot',
    color: '#00ced1',
    icon: '⚡',
    effect: 'piercing',
    duration: 15000,
  },
  bounce: { name: 'Bounce Shot', color: '#00ff00', icon: '⚽', effect: 'bounce', duration: 18000 },
  fire: { name: 'Fire Mode', color: '#ff4500', icon: '🔥', effect: 'fireMode', duration: 20000 },
  ice: { name: 'Ice Mode', color: '#b0e0e6', icon: '❄️', effect: 'iceMode', duration: 20000 },
  lightning: {
    name: 'Lightning',
    color: '#ffff00',
    icon: '⚡',
    effect: 'lightning',
    duration: 15000,
  },
  poison: { name: 'Poison', color: '#7bff00', icon: '☠️', effect: 'poison', duration: 25000 },
  seismic: {
    name: 'Seismic Wave',
    color: '#8b4513',
    icon: '🌊',
    effect: 'seismic',
    duration: 10000,
  },
  timeFreeze: {
    name: 'Time Freeze',
    color: '#4169e1',
    icon: '🕐',
    effect: 'timeFreeze',
    duration: 5000,
  },
  clone: { name: 'Clone Ship', color: '#9370db', icon: '👥', effect: 'clone', duration: 30000 },
  supernova: { name: 'Supernova', color: '#ff1493', icon: '🌟', effect: 'supernova', duration: 0 },

  // WEAPON COLLECTIBLES (30 types)
  weapon_laser: {
    name: 'Laser',
    color: '#00ffff',
    icon: '🔷',
    effect: 'weapon',
    weapon: 'laser',
    duration: 0,
  },
  weapon_spread: {
    name: 'Spread Shot',
    color: '#ffd700',
    icon: '🎆',
    effect: 'weapon',
    weapon: 'spread',
    duration: 0,
  },
  weapon_plasma: {
    name: 'Plasma',
    color: '#ff00ff',
    icon: '💜',
    effect: 'weapon',
    weapon: 'plasma',
    duration: 0,
  },
  weapon_missile: {
    name: 'Missile',
    color: '#ff6347',
    icon: '🚀',
    effect: 'weapon',
    weapon: 'missile',
    duration: 0,
  },
  weapon_shotgun: {
    name: 'Shotgun',
    color: '#ff4500',
    icon: '🔫',
    effect: 'weapon',
    weapon: 'shotgun',
    duration: 0,
  },
  weapon_flamethrower: {
    name: 'Flamethrower',
    color: '#ff0000',
    icon: '🔥',
    effect: 'weapon',
    weapon: 'flamethrower',
    duration: 0,
  },
  weapon_freeze: {
    name: 'Ice Gun',
    color: '#00bfff',
    icon: '🧊',
    effect: 'weapon',
    weapon: 'freeze',
    duration: 0,
  },
  weapon_electric: {
    name: 'Tesla',
    color: '#ffff00',
    icon: '⚡',
    effect: 'weapon',
    weapon: 'electric',
    duration: 0,
  },
  weapon_poison: {
    name: 'Toxin',
    color: '#7bff00',
    icon: '☠️',
    effect: 'weapon',
    weapon: 'poison',
    duration: 0,
  },
  weapon_explosive: {
    name: 'Explosive',
    color: '#ff8c00',
    icon: '💣',
    effect: 'weapon',
    weapon: 'explosive',
    duration: 0,
  },
  weapon_piercing: {
    name: 'Piercer',
    color: '#9370db',
    icon: '⚒️',
    effect: 'weapon',
    weapon: 'piercing',
    duration: 0,
  },
  weapon_homing: {
    name: 'Homing',
    color: '#32cd32',
    icon: '🎯',
    effect: 'weapon',
    weapon: 'homing',
    duration: 0,
  },
  weapon_bounce: {
    name: 'Ricochet',
    color: '#ff1493',
    icon: '⚽',
    effect: 'weapon',
    weapon: 'bounce',
    duration: 0,
  },
  weapon_beam: {
    name: 'Beam',
    color: '#00ff00',
    icon: '⚡',
    effect: 'weapon',
    weapon: 'beam',
    duration: 0,
  },
  weapon_laserRifle: {
    name: 'Laser Rifle',
    color: '#ff6347',
    icon: '🔷',
    effect: 'weapon',
    weapon: 'laserRifle',
    duration: 0,
  },
  weapon_minigun: {
    name: 'Minigun',
    color: '#e74c3c',
    icon: '⚙️',
    effect: 'weapon',
    weapon: 'minigun',
    duration: 0,
  },
  weapon_railgun: {
    name: 'Railgun',
    color: '#3498db',
    icon: '⚡',
    effect: 'weapon',
    weapon: 'railgun',
    duration: 0,
  },
  weapon_cluster: {
    name: 'Cluster Bombs',
    color: '#9b59b6',
    icon: '💣',
    effect: 'weapon',
    weapon: 'cluster',
    duration: 0,
  },
  weapon_shockwave: {
    name: 'Shockwave',
    color: '#1abc9c',
    icon: '💥',
    effect: 'weapon',
    weapon: 'shockwave',
    duration: 0,
  },
  weapon_flak: {
    name: 'Flak Cannon',
    color: '#e67e22',
    icon: '💀',
    effect: 'weapon',
    weapon: 'flak',
    duration: 0,
  },
  weapon_cryo: {
    name: 'Cryogenic',
    color: '#3498db',
    icon: '❄️',
    effect: 'weapon',
    weapon: 'cryo',
    duration: 0,
  },
  weapon_plasma_rifle: {
    name: 'Plasma Rifle',
    color: '#9b59b6',
    icon: '🔮',
    effect: 'weapon',
    weapon: 'plasmaRifle',
    duration: 0,
  },
  weapon_rocket: {
    name: 'Rocket Launcher',
    color: '#ff6347',
    icon: '🚀',
    effect: 'weapon',
    weapon: 'rocket',
    duration: 0,
  },
  weapon_acid: {
    name: 'Acid Spray',
    color: '#2ecc71',
    icon: '🧪',
    effect: 'weapon',
    weapon: 'acid',
    duration: 0,
  },
  weapon_laserBeam: {
    name: 'Laser Beam',
    color: '#00ffff',
    icon: '🔺',
    effect: 'weapon',
    weapon: 'laserBeam',
    duration: 0,
  },
  weapon_grenade: {
    name: 'Grenade Launcher',
    color: '#ff6b6b',
    icon: '💥',
    effect: 'weapon',
    weapon: 'grenade',
    duration: 0,
  },
  weapon_sniper: {
    name: 'Sniper',
    color: '#95a5a6',
    icon: '🎯',
    effect: 'weapon',
    weapon: 'sniper',
    duration: 0,
  },
  weapon_machinegun: {
    name: 'Machine Gun',
    color: '#e74c3c',
    icon: '⚙️',
    effect: 'weapon',
    weapon: 'machinegun',
    duration: 0,
  },
  weapon_volcano: {
    name: 'Volcano',
    color: '#e67e22',
    icon: '🌋',
    effect: 'weapon',
    weapon: 'volcano',
    duration: 0,
  },
  weapon_nuclear: {
    name: 'Nuclear',
    color: '#ff0000',
    icon: '☢️',
    effect: 'weapon',
    weapon: 'nuclear',
    duration: 0,
  },
  weapon_ultimate: {
    name: 'Ultimate Weapon',
    color: '#ff1493',
    icon: '👑',
    effect: 'weapon',
    weapon: 'ultimate',
    duration: 0,
  },
}

export const createPowerUp = (x, y) => {
  const types = Object.keys(powerUpTypes)
  const randomType = types[Math.floor(Math.random() * types.length)]
  return {
    ...powerUpTypes[randomType],
    x,
    y,
    width: 25,
    height: 25,
    speed: 2,
    rotation: 0,
    pulse: 0,
  }
}

export const applyPowerUp = (gameState, powerUp) => {
  switch (powerUp.effect) {
    case 'restoreHealth':
      gameState.health = Math.min(100, gameState.health + 50)
      break
    case 'addShield':
      gameState.shield = true
      gameState.shieldTimer = powerUp.duration
      break
    case 'rapidFire':
      gameState.rapidFire = true
      gameState.rapidFireTimer = powerUp.duration
      break
    case 'multiShot':
      gameState.multiShot = true
      gameState.multiShotTimer = powerUp.duration
      break
    case 'slowMotion':
      gameState.slowMotion = true
      gameState.slowMotionTimer = powerUp.duration
      break
    case 'missiles':
      gameState.currentWeapon = 'missile'
      gameState.missilePackTimer = powerUp.duration
      break
    case 'speedBoost':
      gameState.player.speed = gameState.player.speed * 1.5
      gameState.speedBoostTimer = powerUp.duration
      break
    case 'coinDoubler':
      gameState.coinDoubler = true
      gameState.coinDoublerTimer = powerUp.duration
      break
    case 'weapon':
      // Change weapon when collecting weapon power-up
      if (powerUp.weapon) {
        gameState.currentWeapon = powerUp.weapon
        console.log('Weapon changed to:', powerUp.weapon)
      }
      break
    default:
      // Handle weapon changes
      if (powerUp.weapon) {
        gameState.currentWeapon = powerUp.weapon
        console.log('Weapon changed to:', powerUp.weapon)
      }
      break
  }
}
