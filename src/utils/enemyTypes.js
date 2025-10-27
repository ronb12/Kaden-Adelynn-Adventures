// Different enemy types
export const enemyVarieties = {
  basic: {
    health: 1,
    speed: 2,
    color: '#ff4757',
    score: 10,
    pattern: 'straight',
    shootChance: 0
  },
  shooter: {
    health: 2,
    speed: 1.5,
    color: '#ff6b8a',
    score: 25,
    pattern: 'straight',
    shootChance: 0.3
  },
  kamikaze: {
    health: 1,
    speed: 4,
    color: '#ff0000',
    score: 30,
    pattern: 'straight',
    shootChance: 0
  },
  tank: {
    health: 5,
    speed: 0.8,
    color: '#8b0000',
    score: 100,
    pattern: 'straight',
    shootChance: 0.6
  },
  fast: {
    health: 1,
    speed: 5,
    color: '#ffff00',
    score: 15,
    pattern: 'zigzag',
    shootChance: 0
  },
  zigzag: {
    health: 2,
    speed: 2.5,
    color: '#ff6347',
    score: 40,
    pattern: 'zigzag',
    shootChance: 0.2
  },
  elite: {
    health: 3,
    speed: 3,
    color: '#9370db',
    score: 75,
    pattern: 'wave',
    shootChance: 0.4
  },
  bomber: {
    health: 2,
    speed: 1.5,
    color: '#ff00ff',
    score: 60,
    pattern: 'straight',
    shootChance: 0.7
  }
}

export const spawnEnemy = (type, x, y) => {
  const enemyConfig = enemyVarieties[type] || enemyVarieties.basic
  return {
    ...enemyConfig,
    x,
    y,
    width: 30,
    height: 30,
    hitbox: {
      x,
      y,
      width: 25,
      height: 25
    },
    rotation: 0,
    shootTimer: 0,
    trail: []
  }
}

export const updateEnemyMovement = (enemy, time) => {
  const baseSpeed = enemy.speed
  let deltaX = 0
  
  switch(enemy.pattern) {
    case 'zigzag':
      deltaX = Math.sin(time * 0.1) * 3
      enemy.x += deltaX
      break
    case 'wave':
      deltaX = Math.sin(time * 0.15) * 4
      enemy.x += deltaX
      enemy.y += baseSpeed
      break
    case 'spiral':
      const angle = time * 0.2
      deltaX = Math.cos(angle) * 2
      enemy.x += deltaX
      enemy.y += baseSpeed + Math.sin(angle) * 1
      break
    default:
      enemy.y += baseSpeed
  }
  
  enemy.shootTimer++
  return enemy
}

