// Boss rendering system
export const drawBossShip = (ctx, boss) => {
  if (!boss) return

  const time = Date.now() / 1000
  const pulse = 1 + Math.sin(time * 2) * 0.05
  const rotation = 0

  ctx.save()
  ctx.translate(boss.x, boss.y)
  ctx.rotate(rotation)
  ctx.scale(pulse, pulse)

  // Main body - enemy-like triangle with cockpit
  const bodyColor = boss.color || '#ff4444'
  const accent = '#222'
  ctx.fillStyle = bodyColor
  ctx.strokeStyle = accent
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(0, -boss.height / 2) // tip
  ctx.lineTo(boss.width / 2, boss.height / 2)
  ctx.lineTo(-boss.width / 2, boss.height / 2)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // Cockpit
  ctx.fillStyle = 'rgba(0,0,0,0.5)'
  ctx.beginPath()
  ctx.arc(0, -boss.height / 6, boss.width / 8, 0, Math.PI * 2)
  ctx.fill()

  // Side wings
  ctx.fillStyle = bodyColor
  ctx.fillRect(-boss.width / 2 - 10, 0, 20, boss.height / 3)
  ctx.fillRect(boss.width / 2 - 10, 0, 20, boss.height / 3)

  // Guns: left/right turrets and nose cannon
  const gunColor = '#333'
  ctx.fillStyle = gunColor
  // left turret
  ctx.fillRect(-boss.width / 2 - 6, boss.height / 8, 12, 18)
  // right turret
  ctx.fillRect(boss.width / 2 - 6, boss.height / 8, 12, 18)
  // nose cannon
  ctx.fillRect(-4, -boss.height / 2, 8, 16)

  // Color accents / stripes
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(-boss.width / 3, boss.height / 3)
  ctx.lineTo(boss.width / 3, boss.height / 3)
  ctx.stroke()

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
