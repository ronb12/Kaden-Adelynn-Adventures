import { useEffect, useRef, useState, useCallback } from 'react'
import './Game.css'

function Game({ onPause, onGameOver, difficulty, selectedShip, isPaused }) {
  const canvasRef = useRef(null)
  const gameLoopRef = useRef(null)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(25)
  const [health, setHealth] = useState(100)
  const [combo, setCombo] = useState(0)
  const [killStreak, setKillStreak] = useState(0)
  
  // Game state
  const gameState = useRef({
    keys: {},
    player: { x: 400, y: 550, width: 40, height: 40, speed: 5 },
    enemies: [],
    bullets: [],
    powerUps: [],
    particles: [],
    enemiesSpawned: 0,
    lastEnemySpawn: 0,
    lastBulletShot: 0,
    currentWeapon: 'laser',
    invulnerable: false,
    rapidFire: false,
    shield: false,
    wingFighters: [],
    boss: null,
    isBossFight: false
  })

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    // Set canvas size
    canvas.width = 800
    canvas.height = 600

    // Start game loop
    if (!isPaused) {
      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    // Keyboard handling
    const handleKeyDown = (e) => {
      gameState.current.keys[e.key] = true
      if (e.key === 'p' || e.key === 'P') {
        onPause()
      }
    }

    const handleKeyUp = (e) => {
      gameState.current.keys[e.key] = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isPaused, onPause])

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const state = gameState.current

    // Clear canvas with starfield
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Draw stars
    drawStarfield(ctx)

    // Update player position
    updatePlayer(state)

    // Update game objects
    updateBullets(state)
    updateEnemies(state)
    updatePowerUps(state)
    updateParticles(state)
    updateWingFighters(state)

    // Check collisions
    checkCollisions(state)

    // Spawn enemies
    spawnEnemies(state)

    // Draw everything
    drawPlayer(ctx, state)
    drawBullets(ctx, state)
    drawEnemies(ctx, state)
    drawPowerUps(ctx, state)
    drawParticles(ctx, state)
    drawWingFighters(ctx, state)
    drawUI(ctx, state)

    // Check game over
    if (lives <= 0) {
      onGameOver(score)
      return
    }

    if (!isPaused) {
      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }
  }, [isPaused, lives, score, onGameOver])

  useEffect(() => {
    if (!isPaused && canvasRef.current) {
      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }
  }, [isPaused, gameLoop])

  // Game functions (simplified versions - space saving)
  const updatePlayer = (state) => {
    if (state.keys['a'] || state.keys['A'] || state.keys['ArrowLeft']) state.player.x = Math.max(20, state.player.x - state.player.speed)
    if (state.keys['d'] || state.keys['D'] || state.keys['ArrowRight']) state.player.x = Math.min(canvasRef.current.width - 20, state.player.x + state.player.speed)
    if (state.keys['w'] || state.keys['W'] || state.keys['ArrowUp']) state.player.y = Math.max(50, state.player.y - state.player.speed)
    if (state.keys['s'] || state.keys['S'] || state.keys['ArrowDown']) state.player.y = Math.min(canvasRef.current.height - 20, state.player.y + state.player.speed)
    
    // Shoot bullets
    const now = Date.now()
    if ((state.keys[' '] || state.keys['Spacebar']) && now - state.lastBulletShot > 200) {
      shootBullet(state)
      state.lastBulletShot = now
    }
  }

  const shootBullet = (state) => {
    const bullet = {
      x: state.player.x,
      y: state.player.y,
      speed: 10,
      owner: 'player',
      weapon: state.currentWeapon
    }
    state.bullets.push(bullet)
    
    // Multi-shot for some weapons
    if (state.currentWeapon === 'spread') {
      state.bullets.push({ ...bullet, x: state.player.x - 15 })
      state.bullets.push({ ...bullet, x: state.player.x + 15 })
      state.bullets.push({ ...bullet, x: state.player.x - 30, speed: 8 })
      state.bullets.push({ ...bullet, x: state.player.x + 30, speed: 8 })
    }
  }

  const updateBullets = (state) => {
    state.bullets = state.bullets.filter(bullet => {
      bullet.y -= bullet.speed
      return bullet.y > -10 && bullet.y < canvasRef.current.height + 10
    })
  }

  const updateEnemies = (state) => {
    state.enemies = state.enemies.filter(enemy => {
      enemy.y += enemy.speed
      if (enemy.pattern === 'zigzag') enemy.x += Math.sin(enemy.y / 10) * 2
      return enemy.y < canvasRef.current.height + 50
    })
  }

  const spawnEnemies = (state) => {
    const now = Date.now()
    if (now - state.lastEnemySpawn > 1500 / difficultyModifier()) {
      const enemy = {
        x: Math.random() * (canvasRef.current.width - 40) + 20,
        y: -30,
        speed: difficultyModifier(),
        pattern: Math.random() > 0.7 ? 'zigzag' : 'normal',
        health: 1,
        type: 'normal'
      }
      state.enemies.push(enemy)
      state.lastEnemySpawn = now
      state.enemiesSpawned++
    }
  }

  const difficultyModifier = () => {
    return difficulty === 'easy' ? 1 : difficulty === 'medium' ? 1.5 : 2
  }

  const checkCollisions = (state) => {
    // Bullet-enemy collisions
    for (let i = state.bullets.length - 1; i >= 0; i--) {
      for (let j = state.enemies.length - 1; j >= 0; j--) {
        const bullet = state.bullets[i]
        const enemy = state.enemies[j]
        if (bullet.owner === 'player' && 
            bullet.x < enemy.x + 30 && bullet.x + 5 > enemy.x &&
            bullet.y < enemy.y + 30 && bullet.y + 5 > enemy.y) {
          state.enemies.splice(j, 1)
          state.bullets.splice(i, 1)
          setScore(s => s + 10)
          setCombo(c => c + 1)
          setKillStreak(k => k + 1)
          break
        }
      }
    }

    // Enemy-player collisions
    if (!state.invulnerable) {
      for (let enemy of state.enemies) {
        if (state.player.x < enemy.x + 30 && state.player.x + state.player.width > enemy.x &&
            state.player.y < enemy.y + 30 && state.player.y + state.player.height > enemy.y) {
          setHealth(h => {
            const newHealth = h - 10
            if (newHealth <= 0) {
              setLives(l => l - 1)
              state.invulnerable = true
              setTimeout(() => { state.invulnerable = false }, 2000)
              return 100
            }
            return newHealth
          })
          state.enemies.splice(state.enemies.indexOf(enemy), 1)
          break
        }
      }
    }
  }

  // Draw functions
  const drawStarfield = (ctx) => {
    ctx.fillStyle = 'white'
    for (let i = 0; i < 100; i++) {
      const x = (i * 79) % 800
      const y = (i * 73) % 600
      ctx.fillRect(x, y, 1, 1)
    }
  }

  const drawPlayer = (ctx, state) => {
    ctx.save()
    if (state.invulnerable) {
      ctx.globalAlpha = 0.5
    }
    ctx.fillStyle = selectedShip === 'kaden' ? '#4ecdc4' : '#ff6b6b'
    ctx.beginPath()
    ctx.moveTo(state.player.x, state.player.y + state.player.height)
    ctx.lineTo(state.player.x + state.player.width / 2, state.player.y)
    ctx.lineTo(state.player.x + state.player.width, state.player.y + state.player.height)
    ctx.closePath()
    ctx.fill()
    
    if (state.shield) {
      ctx.strokeStyle = 'cyan'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(state.player.x + state.player.width / 2, state.player.y + state.player.height / 2, 30, 0, Math.PI * 2)
      ctx.stroke()
    }
    ctx.restore()
  }

  const drawBullets = (ctx, state) => {
    state.bullets.forEach(bullet => {
      ctx.fillStyle = bullet.owner === 'player' ? 'cyan' : 'red'
      ctx.fillRect(bullet.x, bullet.y, 5, 10)
    })
  }

  const drawEnemies = (ctx, state) => {
    state.enemies.forEach(enemy => {
      ctx.fillStyle = '#ff4757'
      ctx.beginPath()
      ctx.moveTo(enemy.x + 15, enemy.y)
      ctx.lineTo(enemy.x, enemy.y + 30)
      ctx.lineTo(enemy.x + 30, enemy.y + 30)
      ctx.closePath()
      ctx.fill()
    })
  }

  const drawPowerUps = (ctx, state) => {
    // Power-up rendering
  }

  const drawParticles = (ctx, state) => {
    state.particles.forEach(particle => {
      ctx.fillStyle = particle.color
      ctx.fillRect(particle.x, particle.y, 2, 2)
    })
  }

  const drawWingFighters = (ctx, state) => {
    state.wingFighters.forEach(fighter => {
      ctx.fillStyle = '#95a5a6'
      ctx.fillRect(fighter.x, fighter.y, 20, 20)
    })
  }

  const updatePowerUps = (state) => {
    // Power-up logic
  }

  const updateParticles = (state) => {
    state.particles = state.particles.filter(p => p.life > 0)
    state.particles.forEach(p => p.life--)
  }

  const updateWingFighters = (state) => {
    state.wingFighters.forEach((fighter, i) => {
      fighter.x = state.player.x + (i % 2 === 0 ? -30 : 70)
      fighter.y = state.player.y + 20
    })
  }

  const drawUI = (ctx, state) => {
    ctx.fillStyle = 'white'
    ctx.font = '20px Arial'
    ctx.fillText(`Score: ${score}`, 10, 30)
    ctx.fillText(`Lives: ${lives}`, 10, 60)
    ctx.fillText(`Health: ${health}/100`, 10, 90)
    ctx.fillText(`Combo: ${combo}x`, 10, 120)
    ctx.fillText(`Kill Streak: ${killStreak}`, 10, 150)
    ctx.fillText(`Weapon: ${state.currentWeapon.toUpperCase()}`, 10, 180)
  }

  return (
    <div className="game-container">
      <canvas ref={canvasRef} className="game-canvas" />
      {isPaused && (
        <div className="pause-overlay">
          <h2>Game Paused</h2>
          <p>Press 'P' to resume</p>
        </div>
      )}
    </div>
  )
}

export default Game

