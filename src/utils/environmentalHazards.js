// Environmental hazards system - moving obstacles and damage zones

export const hazardTypes = {
  movingObstacle: {
    name: 'Moving Obstacle',
    width: 40,
    height: 40,
    speed: 2,
    damage: 10,
    color: '#ff6b6b',
  },
  damageZone: {
    name: 'Damage Zone',
    width: 100,
    height: 100,
    damage: 5,
    color: '#ff0000',
    pulse: true,
  },
  energyField: {
    name: 'Energy Field',
    width: 150,
    height: 150,
    damage: 3,
    color: '#00ffff',
    slow: true,
  },
}

export function createHazard(type, x, y) {
  const hazardDef = hazardTypes[type]
  if (!hazardDef) return null

  return {
    type,
    x,
    y,
    width: hazardDef.width,
    height: hazardDef.height,
    speed: hazardDef.speed || 0,
    damage: hazardDef.damage,
    color: hazardDef.color,
    pulse: hazardDef.pulse || false,
    slow: hazardDef.slow || false,
    angle: Math.random() * Math.PI * 2,
    life: 300, // Frames
  }
}

export function updateHazards(hazards, canvas) {
  return hazards.filter((hazard) => {
    hazard.life--
    
    if (hazard.speed > 0) {
      // Moving obstacle
      hazard.x += Math.cos(hazard.angle) * hazard.speed
      hazard.y += Math.sin(hazard.angle) * hazard.speed
      
      // Bounce off walls
      if (hazard.x < 0 || hazard.x > canvas.width - hazard.width) {
        hazard.angle = Math.PI - hazard.angle
      }
      if (hazard.y < 0 || hazard.y > canvas.height - hazard.height) {
        hazard.angle = -hazard.angle
      }
    }
    
    return hazard.life > 0 && hazard.y < canvas.height + 100
  })
}

export function checkHazardCollision(player, hazards) {
  for (const hazard of hazards) {
    if (
      player.x < hazard.x + hazard.width &&
      player.x + player.width > hazard.x &&
      player.y < hazard.y + hazard.height &&
      player.y + player.height > hazard.y
    ) {
      return hazard
    }
  }
  return null
}

export function spawnHazard(wave, canvas) {
  // Spawn hazards more frequently in later waves
  if (wave < 3) return null
  if (Math.random() > 0.3) return null // 30% chance
  
  const types = Object.keys(hazardTypes)
  const type = types[Math.floor(Math.random() * types.length)]
  const x = Math.random() * (canvas.width - 200) + 100
  const y = -50
  
  return createHazard(type, x, y)
}
