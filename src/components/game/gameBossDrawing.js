import { getBossImage } from '../../utils/bosses'

export function drawBossByType(ctx, boss, bossType, time, healthRatio, isDamaged) {
  const w = boss.width
  const h = boss.height
  const color = boss.color
  const glowPulse = Math.sin(time * 3) * 0.3 + 0.7
  const corePulse = Math.sin(time * 4) * 0.3 + 0.7

  // Multi-layered outer glow rings (animated)
  for (let layer = 0; layer < 3; layer++) {
    ctx.shadowBlur = 50 - layer * 15
    ctx.shadowColor = color
    ctx.strokeStyle = color + Math.floor(glowPulse * 100).toString(16).padStart(2, '0')
    ctx.lineWidth = 6 - layer * 2
    ctx.globalAlpha = (0.4 - layer * 0.1) * glowPulse
    ctx.beginPath()
    ctx.arc(0, 0, w / 2 + 15 - layer * 5, 0, Math.PI * 2)
    ctx.stroke()
  }
  ctx.shadowBlur = 0
  ctx.globalAlpha = 1

  switch (bossType) {
    case 'asteroid': {
      // Asteroid King - Rough, jagged, rock-like design
      ctx.fillStyle = color
      ctx.beginPath()
      const points = 12
      for (let i = 0; i < points; i++) {
        const angle = (Math.PI * 2 / points) * i
        const radius = (w / 2) * (0.8 + Math.sin(i * 2) * 0.2)
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.fill()

      ctx.strokeStyle = '#ffd700'
      ctx.lineWidth = 2
      for (let i = 0; i < 4; i++) {
        const angle = (Math.PI / 2) * i + time * 0.1
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(Math.cos(angle) * w / 3, Math.sin(angle) * h / 3)
        ctx.stroke()
      }

      ctx.fillStyle = '#ffffff'
      ctx.globalAlpha = 0.6
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i
        const dist = w / 3
        ctx.beginPath()
        ctx.arc(Math.cos(angle) * dist, Math.sin(angle) * dist, 4, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      for (let i = 0; i < 4; i++) {
        const angle = (Math.PI / 2) * i
        const dist = w / 2 - 10
        const tx = Math.cos(angle) * dist
        const ty = Math.sin(angle) * dist
        ctx.fillStyle = '#444444'
        ctx.fillRect(tx - 3, ty - 3, 6, 6)
      }
      break
    }

    case 'alien': {
      const bodyGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, w / 2)
      bodyGradient.addColorStop(0, color)
      bodyGradient.addColorStop(0.5, color + 'aa')
      bodyGradient.addColorStop(1, '#000000')
      ctx.fillStyle = bodyGradient
      ctx.beginPath()
      ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.globalAlpha = 0.6 + Math.sin(time * 2) * 0.3
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI / 4) * i
        const dist = w / 3
        ctx.beginPath()
        ctx.arc(Math.cos(angle) * dist, Math.sin(angle) * dist, 8, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.globalAlpha = 1

      ctx.strokeStyle = '#00ff00'
      ctx.lineWidth = 3
      ctx.shadowBlur = 10
      ctx.shadowColor = '#00ff00'
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i + time * 0.3
        const dist = w / 2 + 5
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(Math.cos(angle) * dist, Math.sin(angle) * dist)
        ctx.stroke()
      }
      ctx.shadowBlur = 0
      break
    }

    case 'robot': {
      const bodyGradient = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2)
      bodyGradient.addColorStop(0, color)
      bodyGradient.addColorStop(0.3, '#666666')
      bodyGradient.addColorStop(0.6, '#333333')
      bodyGradient.addColorStop(1, '#000000')
      ctx.fillStyle = bodyGradient

      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i
        const x = Math.cos(angle) * w / 2
        const y = Math.sin(angle) * h / 2
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.fill()

      ctx.strokeStyle = '#222222'
      ctx.lineWidth = 1
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(Math.cos(angle) * w / 2, Math.sin(angle) * h / 2)
        ctx.stroke()
      }

      ctx.fillStyle = '#ff6600'
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i
        const dist = w / 3
        const px = Math.cos(angle) * dist
        const py = Math.sin(angle) * dist
        ctx.beginPath()
        ctx.arc(px, py, 6, 0, Math.PI * 2)
        ctx.fill()
      }

      for (let i = 0; i < 4; i++) {
        const angle = (Math.PI / 2) * i + time * 0.1
        const dist = w / 2 - 8
        const tx = Math.cos(angle) * dist
        const ty = Math.sin(angle) * dist
        ctx.fillStyle = '#444444'
        ctx.fillRect(tx - 6, ty - 6, 12, 12)
        ctx.fillStyle = '#222222'
        ctx.fillRect(tx - 2, ty - 15, 4, 12)
        ctx.fillStyle = '#00ffff'
        ctx.globalAlpha = 0.5 + Math.sin(time * 3 + i) * 0.3
        ctx.beginPath()
        ctx.arc(tx, ty, 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
      }
      break
    }

    case 'dragon': {
      const bodyGradient = ctx.createLinearGradient(0, -h / 2, 0, h / 2)
      bodyGradient.addColorStop(0, color)
      bodyGradient.addColorStop(0.3, '#cc0000')
      bodyGradient.addColorStop(0.7, '#990000')
      bodyGradient.addColorStop(1, '#000000')
      ctx.fillStyle = bodyGradient
      ctx.beginPath()
      ctx.ellipse(0, 0, w / 2.5, h / 1.5, 0, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#ff3333'
      ctx.globalAlpha = 0.4
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 6; col++) {
          const x = (col - 2.5) * w / 6
          const y = (row - 1.5) * h / 4
          ctx.beginPath()
          ctx.arc(x, y, 4, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      ctx.globalAlpha = 1

      ctx.strokeStyle = color
      ctx.lineWidth = 4
      ctx.shadowBlur = 15
      ctx.shadowColor = color
      for (let i = 0; i < 4; i++) {
        const angle = (Math.PI / 2) * i + Math.sin(time) * 0.2
        const dist = w / 2 + 10
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(Math.cos(angle) * dist, Math.sin(angle) * dist)
        ctx.stroke()
      }
      ctx.shadowBlur = 0

      const dragonCore = ctx.createRadialGradient(0, 0, 0, 0, 0, w / 4)
      dragonCore.addColorStop(0, '#ffffff')
      dragonCore.addColorStop(0.3, '#ff00ff')
      dragonCore.addColorStop(0.6, color)
      dragonCore.addColorStop(1, '#000000')
      ctx.fillStyle = dragonCore
      ctx.globalAlpha = 0.9 * corePulse
      ctx.beginPath()
      ctx.arc(0, 0, (w / 4) * corePulse, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1

      if (isDamaged) {
        ctx.fillStyle = '#ff6600'
        ctx.globalAlpha = 0.7
        for (let i = 0; i < 8; i++) {
          const angle = -Math.PI / 2 + (i - 4) * 0.2
          const dist = h / 2 + 10 + Math.sin(time * 3 + i) * 5
          ctx.beginPath()
          ctx.arc(Math.cos(angle) * dist, Math.sin(angle) * dist, 4, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.globalAlpha = 1
      }
      break
    }

    default: {
      const bodyGradient = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2)
      const color2 = isDamaged ? '#ff3333' : color
      bodyGradient.addColorStop(0, color)
      bodyGradient.addColorStop(0.2, color2 + 'cc')
      bodyGradient.addColorStop(0.4, '#1a1a1a')
      bodyGradient.addColorStop(0.6, '#000000')
      bodyGradient.addColorStop(0.8, color2 + 'cc')
      bodyGradient.addColorStop(1, color)
      ctx.fillStyle = bodyGradient

      ctx.beginPath()
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI / 4) * i
        const x = Math.cos(angle) * w / 2
        const y = Math.sin(angle) * h / 2
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.fill()

      const rimGradient = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2)
      rimGradient.addColorStop(0, '#ffff00')
      rimGradient.addColorStop(0.5, '#ff6600')
      rimGradient.addColorStop(1, '#ffff00')
      ctx.strokeStyle = rimGradient
      ctx.lineWidth = 5
      ctx.stroke()
      break
    }
  }

  // Universal elements for all bosses
  for (let plate = 0; plate < 2; plate++) {
    const plateSize = (w / 2) * (0.7 - plate * 0.15)
    const plateGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, plateSize)
    plateGradient.addColorStop(0, color + 'aa')
    plateGradient.addColorStop(0.5, '#333333')
    plateGradient.addColorStop(1, '#000000')
    ctx.fillStyle = plateGradient
    ctx.beginPath()
    ctx.arc(0, 0, plateSize, 0, Math.PI * 2)
    ctx.fill()
  }

  const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, w / 3)
  coreGradient.addColorStop(0, '#ffffff')
  coreGradient.addColorStop(0.2, '#00ffff')
  coreGradient.addColorStop(0.4, color)
  coreGradient.addColorStop(0.7, color + '80')
  coreGradient.addColorStop(1, '#000000')
  ctx.fillStyle = coreGradient
  ctx.globalAlpha = 0.9 * corePulse
  ctx.beginPath()
  ctx.arc(0, 0, (w / 3) * corePulse, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#ffffff'
  ctx.globalAlpha = 0.6 * corePulse
  ctx.beginPath()
  ctx.arc(0, 0, (w / 6) * corePulse, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1

  if (isDamaged) {
    ctx.fillStyle = '#ff3333'
    ctx.globalAlpha = 0.6
    for (let i = 0; i < 8; i++) {
      const sparkAngle = (Math.PI / 4) * i + time * 2
      const sparkDist = w / 2 + Math.sin(time * 5 + i) * 5
      ctx.beginPath()
      ctx.arc(Math.cos(sparkAngle) * sparkDist, Math.sin(sparkAngle) * sparkDist, 3, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  if (!isDamaged && healthRatio > 0.7) {
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.globalAlpha = 0.3 + Math.sin(time * 2) * 0.2
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.arc(0, 0, w / 2 + 20, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.globalAlpha = 1
  }
}

export function drawBoss(ctx, state) {
  if (!state.boss) return

  const time = Date.now() / 1000
  const pulse = Math.sin(time * 2) * 0.05 + 0.95
  const rotation = time * 0.05
  const healthRatio = state.boss.health / (state.boss.maxHealth || state.boss.health)
  const isDamaged = healthRatio < 0.5

  const bossImg = getBossImage(state.boss.type || 'asteroid')

  ctx.save()
  ctx.translate(state.boss.x, state.boss.y)

  if (bossImg && bossImg.width) {
    ctx.rotate(rotation)
    ctx.globalAlpha = 0.95 + Math.sin(time * 3) * 0.05
    ctx.shadowBlur = 40
    ctx.shadowColor = state.boss.color
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
    ctx.drawImage(
      bossImg,
      -state.boss.width / 2,
      -state.boss.height / 2,
      state.boss.width,
      state.boss.height
    )
    ctx.shadowBlur = 0
    ctx.globalAlpha = 1
  } else {
    const bossType = state.boss.type || 'asteroid'
    ctx.rotate(rotation)
    ctx.scale(pulse, pulse)
    drawBossByType(ctx, state.boss, bossType, time, healthRatio, isDamaged)
  }

  ctx.restore()

  // Enhanced boss health bar
  const barWidth = Math.max(150, state.boss.width * 0.8)
  const barHeight = 14
  const barX = state.boss.x - barWidth / 2
  const barY = state.boss.y - state.boss.height / 2 - 50

  const maxHealth = state.boss.maxHealth || state.boss.health
  const healthPercent = Math.max(0, Math.min(1, state.boss.health / maxHealth))

  ctx.shadowBlur = 20
  ctx.shadowColor = state.boss.color
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
  ctx.fillRect(barX - 4, barY - 4, barWidth + 8, barHeight + 8)
  ctx.shadowBlur = 0

  const bgGradient = ctx.createLinearGradient(barX, barY, barX, barY + barHeight)
  bgGradient.addColorStop(0, '#330000')
  bgGradient.addColorStop(1, '#660000')
  ctx.fillStyle = bgGradient
  ctx.fillRect(barX, barY, barWidth, barHeight)

  const healthGradient = ctx.createLinearGradient(barX, barY, barX, barY + barHeight)
  if (healthPercent > 0.6) {
    healthGradient.addColorStop(0, '#00ff00')
    healthGradient.addColorStop(0.5, '#00cc00')
    healthGradient.addColorStop(1, '#009900')
  } else if (healthPercent > 0.3) {
    healthGradient.addColorStop(0, '#ffff00')
    healthGradient.addColorStop(0.5, '#ffcc00')
    healthGradient.addColorStop(1, '#ff9900')
  } else {
    healthGradient.addColorStop(0, '#ff0000')
    healthGradient.addColorStop(0.5, '#cc0000')
    healthGradient.addColorStop(1, '#990000')
  }
  ctx.fillStyle = healthGradient
  ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight)

  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
  ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight / 2)

  const borderAlpha = healthPercent < 0.3 ? 0.8 + Math.sin(time * 5) * 0.2 : 1
  ctx.strokeStyle = `rgba(255, 255, 255, ${borderAlpha})`
  ctx.lineWidth = 3
  ctx.strokeRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4)

  ctx.font = 'bold 16px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#ffffff'
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 3
  const bossName = state.boss.name || 'BOSS'
  ctx.strokeText(bossName, state.boss.x, barY - 20)
  ctx.fillText(bossName, state.boss.x, barY - 20)
}

