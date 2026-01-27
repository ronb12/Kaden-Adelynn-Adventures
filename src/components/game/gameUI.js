import { getPersonalBest } from '../../utils/scoreTracking'

export function drawUI(ctx, state, { canvasRef, score, wave, level, combo, livesRef, healthRef }) {
  const canvas = canvasRef.current
  if (!canvas) return
  const cw = canvas.width
  const isMobile = cw < 520
  const barH = isMobile ? 76 : 56
  // Horizontal bar background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
  ctx.fillRect(0, 0, cw, barH)
  const bgGradient = ctx.createLinearGradient(0, 0, cw, 0)
  bgGradient.addColorStop(0, 'rgba(102, 126, 234, 0.5)')
  bgGradient.addColorStop(1, 'rgba(118, 75, 162, 0.5)')
  ctx.fillStyle = bgGradient
  ctx.fillRect(0, 0, cw, 3)

  // Layout left-to-right
  let x = 10
  let y = isMobile ? 22 : 22
  const row2Y = isMobile ? 44 : 22
  const pad = isMobile ? 12 : 18
  const rightReserve = isMobile ? 120 : 180

  const place = (text, setStyle) => {
    if (setStyle) setStyle()
    const w = ctx.measureText(text).width
    if (isMobile && x + w > cw - rightReserve) {
      x = 10
      y = row2Y
    }
    ctx.fillText(text, x, y)
    x += w + pad
  }

  // SCORE label
  ctx.shadowBlur = 10
  ctx.shadowColor = '#4ecdc4'
  ctx.fillStyle = '#4ecdc4'
  ctx.font = isMobile ? 'bold 14px Arial' : 'bold 18px Arial'
  place('SCORE')
  ctx.shadowBlur = 0

  // Score value
  ctx.font = isMobile ? 'bold 14px Arial' : 'bold 18px Arial'
  ctx.fillStyle = '#fff'
  const currentScore = state.currentScore || score
  const scoreText = currentScore.toString().padStart(8, '0')
  place(scoreText)

  // Lives
  ctx.fillStyle = '#ff6b6b'
  ctx.font = isMobile ? 'bold 13px Arial' : 'bold 16px Arial'
  const livesText = `❤️ × ${livesRef.current}`
  place(livesText)

  // Best
  ctx.font = isMobile ? '11px Arial' : '12px Arial'
  ctx.fillStyle = '#ffff00'
  const bestText = `BEST: ${getPersonalBest().toString().padStart(8, '0')}`
  place(bestText)

  // Health percentage
  const healthValue = Math.round(Math.max(0, Math.min(100, healthRef.current)))
  const healthText = `HEALTH: ${healthValue}%`
  ctx.fillStyle = '#2ecc71'
  if (healthValue <= 50) ctx.fillStyle = '#f39c12'
  if (healthValue <= 25) ctx.fillStyle = '#e74c3c'
  const hw = ctx.measureText(healthText).width
  ctx.fillText(healthText, x, y)
  x += hw + pad

  // Shooting Accuracy - Always show, even at 0%
  const shotsFired = state.shotsFired || 0
  const shotsHit = state.shotsHit || 0
  let accuracy = 0
  if (shotsFired > 0) {
    accuracy = Math.round((shotsHit / shotsFired) * 100)
    accuracy = Math.max(0, Math.min(100, accuracy))
  }
  
  ctx.font = isMobile ? 'bold 12px Arial' : 'bold 13px Arial'
  if (accuracy >= 70) {
    ctx.fillStyle = '#2ecc71'
  } else if (accuracy >= 50) {
    ctx.fillStyle = '#f39c12'
  } else {
    ctx.fillStyle = '#e74c3c'
  }
  
  const accuracyText = `ACC: ${accuracy}%`
  const accWidth = ctx.measureText(accuracyText).width
  if (isMobile && x + accWidth > cw - rightReserve) {
    x = 10
    y = row2Y
  }
  ctx.fillText(accuracyText, x, y)
  x += accWidth + pad

  // Wave | Level
  ctx.font = isMobile ? '12px Arial' : '14px Arial'
  ctx.fillStyle = '#ffd700'
  const wl = `Wave: ${wave} | Level: ${level}`
  place(wl)

  // Combo (pulsing)
  if (combo > 0) {
    const pulse = Math.sin(Date.now() / 100) * 0.3 + 0.7
    ctx.fillStyle = `rgba(255, 215, 0, ${pulse})`
    ctx.font = isMobile ? 'bold 12px Arial' : 'bold 14px Arial'
    const comboText = `⚡ COMBO × ${combo}`
    place(comboText)
  }

  // Kills and Stars
  ctx.fillStyle = '#95a5a6'
  ctx.font = isMobile ? '11px Arial' : '12px Arial'
  const killsText = `Kills: ${state.currentKills || 0}`
  place(killsText)
  const coinsText = `⭐ ${state.coins}`
  place(coinsText)

  // Current weapon
  ctx.fillStyle = '#4ecdc4'
  ctx.font = isMobile ? 'bold 11px Arial' : 'bold 12px Arial'
  const weaponText = `⚔️ ${state.currentWeapon.toUpperCase()}`
  place(weaponText)

  // Power-up badges (right side)
  let rx = cw - 10
  ctx.textAlign = 'right'
  ctx.font = isMobile ? '11px Arial' : '12px Arial'
  const midY = y
  if (state.coinDoubler) {
    ctx.fillStyle = '#2ecc71'
      ctx.fillText('⭐ Doubler', rx, midY + 14)
    rx -= 90
  }
  if (state.slowMotion) {
    ctx.fillStyle = '#9b59b6'
    ctx.fillText('⏰ Slow', rx, midY + 14)
    rx -= 70
  }
  if (state.rapidFire) {
    ctx.fillStyle = '#ff6b6b'
    ctx.fillText('⚡ Rapid', rx, midY + 14)
    rx -= 70
  }
  if (state.shield) {
    ctx.fillStyle = '#00ffff'
    ctx.fillText('🛡️ Shield', rx, midY + 14)
  }
  ctx.textAlign = 'left'
}

