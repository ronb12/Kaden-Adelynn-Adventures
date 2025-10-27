// Boss designs and patterns
export const bossTypes = {
  asteroid: {
    name: 'Asteroid King',
    health: 200,
    speed: 1,
    color: '#8b4513',
    pattern: 'straight',
    reward: 1000,
    phase: 1,
    width: 100,
    height: 100
  },
  alien: {
    name: 'Alien Mothership',
    health: 500,
    speed: 2,
    color: '#7bff00',
    pattern: 'zigzag',
    reward: 2500,
    phase: 1,
    width: 120,
    height: 120
  },
  robot: {
    name: 'Mechanical Overlord',
    health: 800,
    speed: 1.5,
    color: '#ff00ff',
    pattern: 'circular',
    reward: 5000,
    phase: 1,
    width: 140,
    height: 140
  },
  dragon: {
    name: 'Space Dragon',
    health: 1000,
    speed: 2.5,
    color: '#ff0000',
    pattern: 'dive',
    reward: 10000,
    phase: 1,
    width: 160,
    height: 160
  }
}

export const spawnBoss = (type, x, y) => {
  return {
    ...bossTypes[type],
    x,
    y,
    angle: 0,
    shootTimer: 0,
    phaseTimer: 0,
    bullets: []
  }
}

export const updateBossPattern = (boss, time, canvas) => {
  switch(boss.pattern) {
    case 'zigzag':
      boss.x += Math.sin(time * 0.1) * boss.speed * 2
      boss.x = Math.max(boss.width / 2, Math.min(canvas.width - boss.width / 2, boss.x))
      break
    case 'circular':
      boss.angle += 0.05
      boss.x = canvas.width / 2 + Math.cos(boss.angle) * 150
      boss.y = canvas.height / 4 + Math.sin(boss.angle) * 50
      break
    case 'dive':
      boss.y += Math.sin(time * 0.1) * 2
      if (boss.y > canvas.height / 2) boss.y = canvas.height / 4
      break
    default:
      if (boss.y > 100) boss.y -= boss.speed
  }
  
  boss.shootTimer++
  return boss
}

