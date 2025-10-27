// Power-up system
export const powerUpTypes = {
  health: {
    name: 'Health Boost',
    color: '#4ecdc4',
    icon: '❤️',
    effect: 'restoreHealth',
    duration: 0
  },
  shield: {
    name: 'Shield',
    color: '#00ffff',
    icon: '🛡️',
    effect: 'addShield',
    duration: 10000
  },
  rapidFire: {
    name: 'Rapid Fire',
    color: '#ff6b6b',
    icon: '⚡',
    effect: 'rapidFire',
    duration: 15000
  },
  multiShot: {
    name: 'Multi Shot',
    color: '#ffd700',
    icon: '🎯',
    effect: 'multiShot',
    duration: 20000
  },
  slowMotion: {
    name: 'Slow Motion',
    color: '#9b59b6',
    icon: '⏰',
    effect: 'slowMotion',
    duration: 8000
  },
  missilePack: {
    name: 'Missile Pack',
    color: '#e74c3c',
    icon: '🚀',
    effect: 'missiles',
    duration: 30000
  },
  speedBoost: {
    name: 'Speed Boost',
    color: '#3498db',
    icon: '💨',
    effect: 'speedBoost',
    duration: 12000
  },
  coinDoubler: {
    name: 'Score Doubler',
    color: '#2ecc71',
    icon: '💰',
    effect: 'coinDoubler',
    duration: 25000
  }
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
    pulse: 0
  }
}

export const applyPowerUp = (gameState, powerUp) => {
  switch(powerUp.effect) {
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
  }
}

