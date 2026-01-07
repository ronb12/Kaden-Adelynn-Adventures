// Asteroid system
export const updateAsteroid = (asteroid, state, canvas) => {
  const timeScale = Math.min(state.deltaTime / 16.67, 2)
  asteroid.x += asteroid.vx * timeScale
  asteroid.y += asteroid.vy * timeScale
  asteroid.rotation += 0.02 * timeScale

  // Wrap around screen
  if (asteroid.x < -50) asteroid.x = canvas.width + 50
  if (asteroid.x > canvas.width + 50) asteroid.x = -50
  if (asteroid.y < -50) asteroid.y = canvas.height + 50
  if (asteroid.y > canvas.height + 50) asteroid.y = -50
}

export const drawAsteroid = (ctx, asteroid) => {
  ctx.save()
  ctx.translate(asteroid.x, asteroid.y)
  ctx.rotate(asteroid.rotation)

  ctx.fillStyle = '#8B4513'
  ctx.beginPath()
  ctx.moveTo(0, -asteroid.size)
  ctx.lineTo(asteroid.size * 0.7, -asteroid.size * 0.5)
  ctx.lineTo(asteroid.size * 0.8, asteroid.size * 0.5)
  ctx.lineTo(0, asteroid.size)
  ctx.lineTo(-asteroid.size * 0.8, asteroid.size * 0.5)
  ctx.lineTo(-asteroid.size * 0.7, -asteroid.size * 0.5)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = '#654321'
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.restore()
}

export const createAsteroid = (x, y) => ({
  x: x,
  y: y,
  size: 20 + Math.random() * 30,
  vx: (Math.random() - 0.5) * 2,
  vy: (Math.random() - 0.5) * 2,
  rotation: Math.random() * Math.PI * 2,
  health: 2,
})
