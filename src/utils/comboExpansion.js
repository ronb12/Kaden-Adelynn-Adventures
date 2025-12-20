// Expanded combo system with chains, visual feedback, and combo-based power-ups

export function calculateComboMultiplier(combo) {
  // Exponential scaling
  if (combo < 5) return 1.0
  if (combo < 10) return 1.2
  if (combo < 20) return 1.5
  if (combo < 30) return 2.0
  if (combo < 50) return 2.5
  return 3.0
}

export function createComboEffect(combo, x, y) {
  const effects = []
  
  // Base combo effect
  effects.push({
    type: 'text',
    text: `${combo}x COMBO!`,
    x,
    y,
    size: 20 + Math.min(combo / 2, 20),
    color: getComboColor(combo),
    life: 60,
    vx: (Math.random() - 0.5) * 2,
    vy: -3,
  })
  
  // Particle burst for high combos
  if (combo >= 10) {
    for (let i = 0; i < Math.min(combo / 2, 20); i++) {
      effects.push({
        type: 'particle',
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        color: getComboColor(combo),
        size: 3,
        life: 30,
      })
    }
  }
  
  // Special effects for milestone combos
  if (combo === 10 || combo === 25 || combo === 50) {
    effects.push({
      type: 'milestone',
      text: `MILESTONE: ${combo}x!`,
      x,
      y: y - 30,
      size: 24,
      color: '#ffd700',
      life: 90,
    })
  }
  
  return effects
}

function getComboColor(combo) {
  if (combo < 5) return '#ffffff'
  if (combo < 10) return '#00ffff'
  if (combo < 20) return '#00ff00'
  if (combo < 30) return '#ffff00'
  if (combo < 50) return '#ff8800'
  return '#ff0000'
}

export function getComboPowerUp(combo) {
  // Chance to spawn power-up based on combo
  if (combo < 10) return null
  if (combo >= 50 && Math.random() < 0.3) return 'ultimate'
  if (combo >= 30 && Math.random() < 0.2) return 'rapidFire'
  if (combo >= 20 && Math.random() < 0.15) return 'shield'
  if (combo >= 10 && Math.random() < 0.1) return 'health'
  return null
}

export function updateComboEffects(effects) {
  return effects.filter((effect) => {
    effect.life--
    
    if (effect.type === 'text' || effect.type === 'milestone') {
      effect.x += effect.vx || 0
      effect.y += effect.vy || 0
      effect.vy *= 0.98 // Gravity
    } else if (effect.type === 'particle') {
      effect.x += effect.vx
      effect.y += effect.vy
      effect.vy += 0.1 // Gravity
      effect.size *= 0.98
    }
    
    return effect.life > 0
  })
}
