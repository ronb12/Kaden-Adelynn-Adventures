// Boss rendering system
export const drawBossShip = (ctx, boss) => {
  if (!boss) return
  
  const time = Date.now() / 1000
  const pulse = Math.sin(time * 2) * 0.1 + 0.9
  const rotation = time * 0.1
  
  ctx.save()
  ctx.translate(boss.x, boss.y)
  ctx.rotate(rotation)
  ctx.scale(pulse, pulse)
  
  // Main body - hexagonal sci-fi ship
  const gradient = ctx.createLinearGradient(-boss.width/2, -boss.height/2, boss.width/2, boss.height/2)
  gradient.addColorStop(0, boss.color)
  gradient.addColorStop(0.5, '#000000')
  gradient.addColorStop(1, boss.color)
  ctx.fillStyle = gradient
  
  ctx.beginPath()
  // Hexagonal shape
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i
    const x = Math.cos(angle) * boss.width / 2
    const y = Math.sin(angle) * boss.height / 2
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = '#ffff00'
  ctx.lineWidth = 3
  ctx.stroke()
  
  // Inner core
  ctx.fillStyle = '#ff0080'
  ctx.globalAlpha = 0.6
  ctx.beginPath()
  ctx.arc(0, 0, boss.width / 4, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1
  
  // Weapon arrays
  ctx.strokeStyle = '#00ffff'
  ctx.lineWidth = 2
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI / 4) * i
    const dist = boss.width / 2 - 5
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(Math.cos(angle) * dist, Math.sin(angle) * dist)
    ctx.stroke()
  }
  
  // Glow effect
  ctx.shadowBlur = 20
  ctx.shadowColor = '#ff0080'
  ctx.fillStyle = '#ff0080'
  ctx.beginPath()
  ctx.arc(0, 0, boss.width / 6, 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowBlur = 0
  
  ctx.restore()
}

export const drawBossHealthBar = (ctx, boss) => {
  const barWidth = 120
  const barHeight = 10
  const barX = boss.x - barWidth / 2
  const barY = boss.y - boss.height / 2 - 40
  
  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
  ctx.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4)
  
  // Red bar
  ctx.fillStyle = '#ff0000'
  ctx.fillRect(barX, barY, barWidth, barHeight)
  
  // Green bar (health)
  const maxHealth = boss.maxHealth || boss.health
  const healthPercent = boss.health / maxHealth
  ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.25 ? '#ffff00' : '#ff0000'
  ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight)
  
  // Border
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 2
  ctx.strokeRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4)
}

