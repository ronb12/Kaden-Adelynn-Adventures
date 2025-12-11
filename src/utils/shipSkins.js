// Ship skin visual effects and color schemes

export function getShipSkinColors(skinName, baseColor = '#4ecdc4', baseAccent = '#00ffff') {
  const time = Date.now() / 1000
  
  switch (skinName) {
    case 'neon':
      return {
        shipColor: '#00ffff',
        accentColor: '#ff00ff',
        glowColor: '#00ffff',
        glowIntensity: 30,
        engineColor: '#00ffff',
        hasPulse: true,
        pulseSpeed: 3,
      }
    
    case 'gold':
      return {
        shipColor: '#ffd700',
        accentColor: '#ffed4e',
        glowColor: '#ffd700',
        glowIntensity: 25,
        engineColor: '#ffaa00',
        hasPulse: false,
        hasShine: true,
      }
    
    case 'chrome':
      return {
        shipColor: '#c0c0c0',
        accentColor: '#ffffff',
        glowColor: '#e0e0e0',
        glowIntensity: 20,
        engineColor: '#ffffff',
        hasPulse: false,
        hasReflection: true,
      }
    
    case 'rainbow':
      const hue = (time * 50) % 360
      return {
        shipColor: `hsl(${hue}, 100%, 60%)`,
        accentColor: `hsl(${(hue + 60) % 360}, 100%, 70%)`,
        glowColor: `hsl(${hue}, 100%, 60%)`,
        glowIntensity: 35,
        engineColor: `hsl(${(hue + 120) % 360}, 100%, 50%)`,
        hasPulse: true,
        pulseSpeed: 2,
      }
    
    case 'dark':
      return {
        shipColor: '#1a1a1a',
        accentColor: '#333333',
        glowColor: '#000000',
        glowIntensity: 15,
        engineColor: '#444444',
        hasPulse: false,
        hasStealth: true,
      }
    
    case 'ice':
      return {
        shipColor: '#87ceeb',
        accentColor: '#b0e0e6',
        glowColor: '#00bfff',
        glowIntensity: 25,
        engineColor: '#add8e6',
        hasPulse: true,
        pulseSpeed: 2,
        hasFrost: true,
      }
    
    case 'fire':
      const fireHue = 15 + Math.sin(time * 3) * 10
      return {
        shipColor: `hsl(${fireHue}, 100%, 50%)`,
        accentColor: `hsl(${fireHue + 20}, 100%, 60%)`,
        glowColor: `hsl(${fireHue}, 100%, 50%)`,
        glowIntensity: 30,
        engineColor: `hsl(${fireHue - 10}, 100%, 40%)`,
        hasPulse: true,
        pulseSpeed: 4,
        hasFlame: true,
      }
    
    case 'default':
    default:
      return {
        shipColor: baseColor,
        accentColor: baseAccent,
        glowColor: baseColor,
        glowIntensity: 20,
        engineColor: baseAccent,
        hasPulse: false,
      }
  }
}

export function applyShipSkinEffects(ctx, skinName, x, y, width, height) {
  const time = Date.now() / 1000
  const colors = getShipSkinColors(skinName)
  
  // Apply glow based on skin
  ctx.shadowBlur = colors.glowIntensity
  ctx.shadowColor = colors.glowColor
  
  // Special effects for specific skins
  if (skinName === 'chrome' && colors.hasReflection) {
    // Chrome reflection effect
    const gradient = ctx.createLinearGradient(x, y, x + width, y + height)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)')
    gradient.addColorStop(0.5, 'rgba(200, 200, 200, 0.3)')
    gradient.addColorStop(1, 'rgba(150, 150, 150, 0.1)')
    ctx.fillStyle = gradient
    return gradient
  }
  
  if (skinName === 'gold' && colors.hasShine) {
    // Gold shine effect
    const shineGradient = ctx.createLinearGradient(x, y, x + width, y + height)
    shineGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)')
    shineGradient.addColorStop(0.3, 'rgba(255, 215, 0, 0.4)')
    shineGradient.addColorStop(1, 'rgba(184, 134, 11, 0.2)')
    return shineGradient
  }
  
  if (skinName === 'ice' && colors.hasFrost) {
    // Ice frost effect
    ctx.strokeStyle = 'rgba(176, 224, 230, 0.8)'
    ctx.lineWidth = 1
    return null
  }
  
  if (skinName === 'fire' && colors.hasFlame) {
    // Fire flicker effect
    const flicker = Math.sin(time * 8) * 0.1 + 0.9
    ctx.globalAlpha = flicker
    return null
  }
  
  return null
}
