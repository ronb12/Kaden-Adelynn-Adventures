import { useEffect, useRef, useState, useCallback } from 'react'
import './Game.css'
import { ParticleSystem } from '../utils/particles'
import { powerUpTypes, createPowerUp, applyPowerUp } from '../utils/powerups'
import { achievements, checkAchievement } from '../utils/achievements'
import { bossTypes, spawnBoss, updateBossPattern } from '../utils/bosses'
import { enemyVarieties, spawnEnemy, updateEnemyMovement } from '../utils/enemyTypes'
import { sounds, playSound } from '../utils/sounds'

function Game({ onPause, onGameOver, difficulty, selectedShip, isPaused }) {
  const canvasRef = useRef(null)
  const gameLoopRef = useRef(null)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(25)
  const [health, setHealth] = useState(100)
  const [combo, setCombo] = useState(0)
  const [killStreak, setKillStreak] = useState(0)
  const [wave, setWave] = useState(1)
  const [level, setLevel] = useState(1)
  const [coins, setCoins] = useState(0)
  const [activePowerUps, setActivePowerUps] = useState([])
  const [unlockedAchievements, setUnlockedAchievements] = useState([])
  const [enemiesKilled, setEnemiesKilled] = useState(0)
  const [timePlayed, setTimePlayed] = useState(0)
  const [bestCombo, setBestCombo] = useState(0)
  const [perfectWaves, setPerfectWaves] = useState(0)
  const [screenShake, setScreenShake] = useState({ x: 0, y: 0 })
  const [hitStop, setHitStop] = useState(false)
  const [scoreMultiplier, setScoreMultiplier] = useState(1)
  
  // Game state
  const gameState = useRef({
    keys: {},
    player: { x: 400, y: 550, width: 40, height: 40, speed: 5 },
    enemies: [],
    bullets: [],
    missiles: [],
    powerUps: [],
    particles: [],
    enemiesSpawned: 0,
    lastEnemySpawn: 0,
    lastBulletShot: 0,
    currentWeapon: 'laser',
    invulnerable: false,
    rapidFire: false,
    rapidFireTimer: 0,
    shield: false,
    shieldTimer: 0,
    wingFighters: [],
    boss: null,
    isBossFight: false,
    wave: 1,
    level: 1,
    comboMultiplier: 1,
    scoreMultiplier: 1,
    slowMotion: false,
    slowMotionTimer: 0,
    missilePackTimer: 0,
    speedBoostTimer: 0,
    coinDoubler: false,
    coinDoublerTimer: 0,
    coins: 0,
    streakCombo: 0,
    perfectWave: true,
    hitstop: false,
    shakeIntensity: 0,
    backgroundOffset: 0,
    nebulaColors: ['#ff6b6b', '#4ecdc4', '#95a5a6', '#ffa502'],
    explosions: [],
    trails: [],
    plasmaBeams: [],
    enemyBullets: []
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

    // Touch controls for mobile
    const handleTouchStart = (e) => {
      e.preventDefault()
      const touch = e.touches[0]
      const rect = canvas.getBoundingClientRect()
      const touchX = touch.clientX - rect.left
      const touchY = touch.clientY - rect.top
      
      // Convert screen coords to canvas coords
      const canvasX = (touchX / rect.width) * 800
      const canvasY = (touchY / rect.height) * 600
      
      gameState.current.player.x = canvasX - gameState.current.player.width / 2
      gameState.current.player.y = canvasY - gameState.current.player.height / 2
      
      // Shoot on touch
      shootBullet(gameState.current)
    }

    const handleTouchMove = (e) => {
      e.preventDefault()
      const touch = e.touches[0]
      const rect = canvas.getBoundingClientRect()
      const touchX = touch.clientX - rect.left
      const touchY = touch.clientY - rect.top
      
      const canvasX = (touchX / rect.width) * 800
      const canvasY = (touchY / rect.height) * 600
      
      gameState.current.player.x = Math.max(0, Math.min(800 - gameState.current.player.width, canvasX - gameState.current.player.width / 2))
      gameState.current.player.y = Math.max(0, Math.min(600 - gameState.current.player.height, canvasY - gameState.current.player.height / 2))
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false })

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      canvas.removeEventListener('touchstart', handleTouchStart)
      canvas.removeEventListener('touchmove', handleTouchMove)
    }
  }, [isPaused, onPause])

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const state = gameState.current

    // Update timers
    updatePowerUpTimers(state)

    // Apply screen shake
    if (state.shakeIntensity > 0) {
      ctx.save()
      ctx.translate((Math.random() - 0.5) * state.shakeIntensity, (Math.random() - 0.5) * state.shakeIntensity)
      state.shakeIntensity *= 0.9
    }

    // Clear canvas with animated background
    drawAnimatedBackground(ctx, state)

    // Update player position
    updatePlayer(state)

    // Update all game objects
    updateBullets(state)
    updateMissiles(state)
    updateEnemies(state)
    updateEnemyBullets(state)
    updatePowerUps(state)
    updateParticles(state)
    updateWingFighters(state)
    updatePlasmaBeams(state)
    updateBoss(state)

    // Check collisions
    checkCollisions(state)

    // Spawn enemies
    spawnEnemies(state)

    // Spawn power-ups
    spawnPowerUps(state)

    // Draw everything with layer order
    drawBackgroundElements(ctx, state)
    drawEnemies(ctx, state)
    drawPowerUps(ctx, state)
    drawBullets(ctx, state)
    drawMissiles(ctx, state)
    drawEnemyBullets(ctx, state)
    drawPlasmaBeams(ctx, state)
    drawWingFighters(ctx, state)
    drawParticles(ctx, state)
    drawPlayer(ctx, state)
    drawBoss(ctx, state)
    drawUI(ctx, state)

    if (state.shakeIntensity > 0) {
      ctx.restore()
    }

    // Check level progression
    checkLevelProgression(state)

    // Check game over
    if (lives <= 0) {
      onGameOver(score)
      return
    }

    setTimePlayed(t => t + 1)

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
    const speed = state.slowMotion ? state.player.speed * 0.5 : state.player.speed
    if (state.keys['a'] || state.keys['A'] || state.keys['ArrowLeft']) state.player.x = Math.max(20, state.player.x - speed)
    if (state.keys['d'] || state.keys['D'] || state.keys['ArrowRight']) state.player.x = Math.min(canvasRef.current.width - 20, state.player.x + speed)
    if (state.keys['w'] || state.keys['W'] || state.keys['ArrowUp']) state.player.y = Math.max(50, state.player.y - speed)
    if (state.keys['s'] || state.keys['S'] || state.keys['ArrowDown']) state.player.y = Math.min(canvasRef.current.height - 20, state.player.y + speed)
    
    // Shoot bullets
    const now = Date.now()
    const fireRate = state.rapidFire ? 100 : 200
    if ((state.keys[' '] || state.keys['Spacebar']) && now - state.lastBulletShot > fireRate) {
      shootBullet(state)
      state.lastBulletShot = now
    }
  }

  const shootBullet = (state) => {
    playSound('laser-shoot', 0.2)
    
    const baseBullet = {
      x: state.player.x,
      y: state.player.y,
      speed: 10,
      owner: 'player',
      weapon: state.currentWeapon,
      width: 5,
      height: 10
    }
    
    switch(state.currentWeapon) {
      case 'spread':
        state.bullets.push({ ...baseBullet, x: state.player.x + state.player.width / 2 })
        state.bullets.push({ ...baseBullet, x: state.player.x - 10, angle: -0.3 })
        state.bullets.push({ ...baseBullet, x: state.player.x + 20, angle: 0.3 })
        break
      case 'plasma':
        state.plasmaBeams.push({ x: state.player.x, y: state.player.y, width: 8, height: 15, life: 50 })
        break
      case 'missile':
        state.missiles.push({ x: state.player.x, y: state.player.y, speed: 8, target: null, explosion: false })
        playSound('missile', 0.3)
        break
      default:
        state.bullets.push({ ...baseBullet, x: state.player.x + state.player.width / 2 })
    }
    
    // Add muzzle flash particle
    state.particles.push(...ParticleSystem.createExplosion(state.player.x + state.player.width / 2, state.player.y, '#ffd700', 5))
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

  // Draw functions - removed duplicate

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
    state.powerUps.forEach(powerUp => {
      ctx.save()
      powerUp.pulse += 0.1
      powerUp.rotation += 0.05
      
      // Glow effect
      ctx.shadowBlur = 20
      ctx.shadowColor = powerUp.color
      
      ctx.translate(powerUp.x, powerUp.y)
      ctx.rotate(powerUp.rotation)
      
      ctx.fillStyle = powerUp.color
      ctx.beginPath()
      ctx.moveTo(0, -powerUp.width / 2)
      ctx.lineTo(powerUp.width / 2, 0)
      ctx.lineTo(0, powerUp.width / 2)
      ctx.lineTo(-powerUp.width / 2, 0)
      ctx.closePath()
      ctx.fill()
      ctx.restore()
      
      // Draw icon
      ctx.font = `${20 + Math.sin(powerUp.pulse) * 5}px Arial`
      ctx.fillText(powerUp.icon, powerUp.x - 10, powerUp.y + 5)
    })
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
    state.powerUps = state.powerUps.filter(powerUp => {
      powerUp.y += powerUp.speed
      
      // Check collision with player
      if (state.player.x < powerUp.x + powerUp.width && 
          state.player.x + state.player.width > powerUp.x &&
          state.player.y < powerUp.y + powerUp.height &&
          state.player.y + state.player.height > powerUp.y) {
        applyPowerUp(state, powerUp)
        playSound('powerup', 0.5)
        state.powerUps.splice(state.powerUps.indexOf(powerUp), 1)
        state.coins += 10
        setCoins(c => c + 10)
        return false
      }
      
      return powerUp.y < canvasRef.current.height + 50
    })
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

  // New feature implementations
  const updatePowerUpTimers = (state) => {
    if (state.rapidFireTimer > 0) {
      state.rapidFireTimer--
      if (state.rapidFireTimer === 0) state.rapidFire = false
    }
    if (state.shieldTimer > 0) {
      state.shieldTimer--
      if (state.shieldTimer === 0) state.shield = false
    }
    if (state.slowMotionTimer > 0) {
      state.slowMotionTimer--
      if (state.slowMotionTimer === 0) state.slowMotion = false
    }
    if (state.missilePackTimer > 0) {
      state.missilePackTimer--
      if (state.missilePackTimer === 0 && state.currentWeapon === 'missile') {
        state.currentWeapon = 'laser'
      }
    }
    if (state.speedBoostTimer > 0) {
      state.speedBoostTimer--
      if (state.speedBoostTimer === 0) state.player.speed = 5
    }
    if (state.coinDoublerTimer > 0) {
      state.coinDoublerTimer--
      if (state.coinDoublerTimer === 0) state.coinDoubler = false
    }
  }

  const updateMissiles = (state) => {
    state.missiles = state.missiles.filter(missile => {
      missile.y -= missile.speed
      missile.speed = Math.min(15, missile.speed + 0.5)
      return missile.y > -50 && missile.y < canvasRef.current.height + 50
    })
  }

  const updateEnemyBullets = (state) => {
    state.enemyBullets = state.enemyBullets.filter(bullet => {
      bullet.y += bullet.speed
      return bullet.y < canvasRef.current.height + 50
    })
  }

  const updatePlasmaBeams = (state) => {
    state.plasmaBeams = state.plasmaBeams.filter(beam => {
      beam.y -= 12
      beam.life--
      return beam.life > 0 && beam.y > -50
    })
  }

  const spawnPowerUps = (state) => {
    const chance = 0.001
    if (Math.random() < chance && !state.isBossFight) {
      const x = Math.random() * (canvasRef.current.width - 50) + 25
      const y = -30
      state.powerUps.push(createPowerUp(x, y))
    }
  }

  const updateBoss = (state) => {
    if (state.boss) {
      const time = Date.now()
      state.boss = updateBossPattern(state.boss, time, canvasRef.current)
      if (state.boss.health <= 0) {
        state.isBossFight = false
        state.boss = null
        playSound('bossSpawn', 0.6)
      }
    }
  }

  const drawAnimatedBackground = (ctx, state) => {
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    drawStarfield(ctx, state.backgroundOffset)
    state.backgroundOffset += 0.5
  }

  const drawStarfield = (ctx, offset = 0) => {
    ctx.fillStyle = 'white'
    for (let i = 0; i < 150; i++) {
      const x = (i * 83) % 800
      const y = ((i * 73) % 600) + (offset % 600)
      const brightness = Math.random()
      ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`
      ctx.fillRect(x, y, 1 + brightness, 1 + brightness)
    }
  }

  const drawBackgroundElements = (ctx, state) => {
    // Draw nebula gradients
    const gradient = ctx.createRadialGradient(
      canvasRef.current.width / 2,
      canvasRef.current.height / 2,
      50,
      canvasRef.current.width / 2,
      canvasRef.current.height / 2,
      300
    )
    gradient.addColorStop(0, 'rgba(255, 107, 107, 0.1)')
    gradient.addColorStop(0.5, 'rgba(78, 205, 196, 0.1)')
    gradient.addColorStop(1, 'transparent')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
  }

  const drawMissiles = (ctx, state) => {
    state.missiles.forEach(missile => {
      ctx.fillStyle = '#ffd700'
      ctx.beginPath()
      ctx.moveTo(missile.x, missile.y)
      ctx.lineTo(missile.x - 5, missile.y - 15)
      ctx.lineTo(missile.x + 5, missile.y - 15)
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = '#ff4500'
      ctx.fillRect(missile.x, missile.y, 3, 20)
    })
  }

  const drawEnemyBullets = (ctx, state) => {
    state.enemyBullets.forEach(bullet => {
      ctx.fillStyle = 'red'
      ctx.beginPath()
      ctx.arc(bullet.x, bullet.y, 5, 0, Math.PI * 2)
      ctx.fill()
    })
  }

  const drawPlasmaBeams = (ctx, state) => {
    state.plasmaBeams.forEach(beam => {
      const gradient = ctx.createLinearGradient(beam.x, beam.y, beam.x, beam.y + beam.height)
      gradient.addColorStop(0, 'rgba(78, 205, 196, 0.9)')
      gradient.addColorStop(1, 'rgba(78, 205, 196, 0.1)')
      ctx.fillStyle = gradient
      ctx.fillRect(beam.x, beam.y, beam.width, beam.height)
    })
  }

  const drawBoss = (ctx, state) => {
    if (!state.boss) return
    ctx.fillStyle = state.boss.color
    ctx.beginPath()
    ctx.ellipse(state.boss.x, state.boss.y, state.boss.width / 2, state.boss.height / 2, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.stroke()
    
    // Boss health bar
    ctx.fillStyle = 'red'
    ctx.fillRect(state.boss.x - 50, state.boss.y - 70, 100, 8)
    ctx.fillStyle = 'green'
    ctx.fillRect(state.boss.x - 50, state.boss.y - 70, (state.boss.health / state.boss.health) * 100, 8)
  }

  const checkLevelProgression = (state) => {
    if (state.enemiesSpawned % 50 === 0 && state.enemiesSpawned > 0) {
      state.wave++
      setWave(state.wave)
      if (state.wave === 5) {
        state.level++
        setLevel(state.level)
        state.isBossFight = true
        state.boss = spawnBoss('asteroid', canvasRef.current.width / 2, 100)
      }
    }
  }

  const drawUI = (ctx, state) => {
    ctx.fillStyle = 'white'
    ctx.font = 'bold 16px Arial'
    ctx.fillText(`Score: ${score}`, 10, 25)
    ctx.fillText(`Lives: ${lives}`, 10, 50)
    ctx.fillText(`Health: ${health}/100`, 10, 75)
    ctx.fillText(`Wave: ${wave}`, 10, 100)
    ctx.fillText(`Level: ${level}`, 10, 125)
    ctx.fillText(`Combo: ${combo}x`, 10, 150)
    ctx.fillText(`Kills: ${killStreak}`, 10, 175)
    ctx.fillText(`Coins: ${state.coins}`, 10, 200)
    ctx.fillText(`Weapon: ${state.currentWeapon.toUpperCase()}`, 10, 225)
    
    // Power-up indicators
    let yPos = 250
    if (state.shield) {
      ctx.fillStyle = '#00ffff'
      ctx.fillText('🛡️ SHIELD', 10, yPos)
      yPos += 20
    }
    if (state.rapidFire) {
      ctx.fillStyle = '#ff6b6b'
      ctx.fillText('⚡ RAPID FIRE', 10, yPos)
      yPos += 20
    }
    if (state.slowMotion) {
      ctx.fillStyle = '#9b59b6'
      ctx.fillText('⏰ SLOW MOTION', 10, yPos)
      yPos += 20
    }
    if (state.coinDoubler) {
      ctx.fillStyle = '#2ecc71'
      ctx.fillText('💰 DOUBLE SCORE', 10, yPos)
      yPos += 20
    }
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

