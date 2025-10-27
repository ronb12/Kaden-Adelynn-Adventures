import { useEffect, useRef, useState, useCallback } from 'react'
import './Game.css'
import { ParticleSystem } from '../utils/particles'
import { powerUpTypes, createPowerUp, applyPowerUp } from '../utils/powerups'
import { achievements, checkAchievement } from '../utils/achievements'
import { bossTypes, spawnBoss, updateBossPattern } from '../utils/bosses'
import { enemyVarieties, spawnEnemy, updateEnemyMovement } from '../utils/enemyTypes'
import { sounds, playSound } from '../utils/sounds'
import { getPersonalBest } from '../utils/scoreTracking'

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
    currentScore: 0,
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
    gameMode: 'classic',  // classic, arcade, survival, bossRush
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
    enemyBullets: [],
    asteroids: [],
    lastAsteroidSpawn: 0,
    lastFrameTime: 0,
    deltaTime: 16.67  // 60fps = 16.67ms per frame
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

  const gameLoop = useCallback((currentTime) => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const state = gameState.current

    // Calculate delta time for frame-rate independent movement (60fps)
    if (state.lastFrameTime === 0) {
      state.lastFrameTime = currentTime
    }
    const deltaTime = currentTime - state.lastFrameTime
    state.lastFrameTime = currentTime
    
    // Throttle to 60fps max (16.67ms per frame)
    if (deltaTime < 16.67) {
      gameLoopRef.current = requestAnimationFrame(gameLoop)
      return
    }
    
    // Normalize delta time to 60fps (multiplier)
    const timeScale = deltaTime / 16.67
    state.deltaTime = deltaTime

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
    updateAsteroids(state)
    spawnAsteroids(state)
    updateBoss(state)

    // Check collisions
    checkCollisions(state)

    // Spawn enemies
    spawnEnemies(state)

    // Spawn power-ups
    spawnPowerUps(state)

    // Draw everything with layer order
    drawBackgroundElements(ctx, state)
    drawAsteroids(ctx, state)
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
    processGameMode(state)

    // Check game over
    if (lives <= 0) {
      onGameOver(score)
      return
    }
    
    // Save score when game ends
    if (lives <= 0 && score > 0) {
      import('../utils/scoreTracking').then(module => {
        module.saveScore(score)
      })
    }

    setTimePlayed(t => t + 1)

    if (!isPaused) {
      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }
  }, [isPaused, lives, onGameOver])

  useEffect(() => {
    if (!isPaused && canvasRef.current) {
      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }
  }, [isPaused, gameLoop])

  // Game functions (simplified versions - space saving)
  const updatePlayer = (state) => {
    const speed = state.slowMotion ? state.player.speed * 0.5 : state.player.speed
    const timeScale = Math.min(state.deltaTime / 16.67, 2) // Cap at 2x speed for stability
    
    if (state.keys['a'] || state.keys['A'] || state.keys['ArrowLeft']) state.player.x = Math.max(20, state.player.x - speed * timeScale)
    if (state.keys['d'] || state.keys['D'] || state.keys['ArrowRight']) state.player.x = Math.min(canvasRef.current.width - 20, state.player.x + speed * timeScale)
    if (state.keys['w'] || state.keys['W'] || state.keys['ArrowUp']) state.player.y = Math.max(50, state.player.y - speed * timeScale)
    if (state.keys['s'] || state.keys['S'] || state.keys['ArrowDown']) state.player.y = Math.min(canvasRef.current.height - 20, state.player.y + speed * timeScale)
    
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
      case 'laser':
        state.bullets.push({ ...baseBullet, x: state.player.x + state.player.width / 2 })
        break
      case 'spread':
        state.bullets.push({ ...baseBullet, x: state.player.x + state.player.width / 2 })
        state.bullets.push({ ...baseBullet, x: state.player.x - 10, angle: -0.3 })
        state.bullets.push({ ...baseBullet, x: state.player.x + 20, angle: 0.3 })
        break
      case 'plasma':
      case 'plasmaRifle':
        state.plasmaBeams.push({ x: state.player.x, y: state.player.y, width: 8, height: 15, life: 50 })
        break
      case 'missile':
      case 'rocket':
        state.missiles.push({ x: state.player.x, y: state.player.y, speed: 8, target: null, explosion: false })
        playSound('missile', 0.3)
        break
      case 'shotgun':
        for (let i = 0; i < 5; i++) {
          state.bullets.push({ ...baseBullet, x: state.player.x + i * 8, angle: (i - 2) * 0.2 })
        }
        break
      case 'minigun':
      case 'machinegun':
        state.bullets.push({ ...baseBullet, x: state.player.x + state.player.width / 2 })
        state.bullets.push({ ...baseBullet, x: state.player.x + state.player.width / 2 + 5, speed: 12 })
        break
      case 'flamethrower':
      case 'fireMode':
        for (let i = 0; i < 3; i++) {
          state.bullets.push({ ...baseBullet, x: state.player.x + i * 10, angle: (i - 1) * 0.15 })
        }
        break
      case 'electric':
      case 'lightning':
        state.bullets.push({ ...baseBullet, x: state.player.x + state.player.width / 2, speed: 15 })
        // Electric effect bullets
        for (let i = 0; i < 3; i++) {
          state.bullets.push({ ...baseBullet, x: state.player.x + i * 15, angle: (i - 1) * 0.1 })
        }
        break
      case 'piercing':
        state.bullets.push({ ...baseBullet, x: state.player.x + state.player.width / 2, pierce: true })
        break
      case 'homing':
        const nearestEnemy = state.enemies[0]
        state.missiles.push({ x: state.player.x, y: state.player.y, speed: 8, target: nearestEnemy, explosion: false, homing: true })
        break
      case 'cluster':
      case 'grenade':
        state.missiles.push({ x: state.player.x, y: state.player.y, speed: 8, cluster: true, explosion: false })
        break
      case 'beam':
      case 'laserBeam':
        state.bullets.push({ ...baseBullet, x: state.player.x + state.player.width / 2, width: 15, height: 20, speed: 15 })
        break
      case 'flak':
        for (let i = 0; i < 4; i++) {
          state.bullets.push({ ...baseBullet, x: state.player.x + i * 10, angle: (i - 1.5) * 0.4 })
        }
        break
      case 'railgun':
      case 'sniper':
        state.bullets.push({ ...baseBullet, x: state.player.x + state.player.width / 2, width: 8, height: 25, speed: 20 })
        break
      default:
        state.bullets.push({ ...baseBullet, x: state.player.x + state.player.width / 2 })
    }
    
    // Add muzzle flash particle
    state.particles.push(...ParticleSystem.createExplosion(state.player.x + state.player.width / 2, state.player.y, '#ffd700', 5))
  }

  const updateBullets = (state) => {
    const timeScale = Math.min(state.deltaTime / 16.67, 2)
    state.bullets = state.bullets.filter(bullet => {
      bullet.y -= bullet.speed * timeScale
      return bullet.y > -10 && bullet.y < canvasRef.current.height + 10
    })
  }

  const updateEnemies = (state) => {
    const timeScale = Math.min(state.deltaTime / 16.67, 2)
    state.enemies = state.enemies.filter(enemy => {
      enemy.y += enemy.speed * timeScale
      if (enemy.pattern === 'zigzag') enemy.x += Math.sin(enemy.y / 10) * 2 * timeScale
    if (enemy.pattern === 'formation') {
      const formationOffset = state.enemiesSpawned % 5 * 40
      enemy.x = Math.sin((enemy.y + formationOffset) / 30) * 50 + canvasRef.current.width / 2
    }
      
      // Make enemies shoot back!
      if (Math.random() < 0.003 && enemy.y > 50 && enemy.y < canvasRef.current.height - 100) {
        state.enemyBullets.push({
          x: enemy.x + 15,
          y: enemy.y + 30,
          speed: 4 * timeScale,
          owner: 'enemy'
        })
      }
      
      return enemy.y < canvasRef.current.height + 50
    })
  }

  const spawnEnemies = (state) => {
    const now = Date.now()
    const spawnRate = 1500 / difficultyModifier()
    if (now - state.lastEnemySpawn > spawnRate) {
      const enemy = {
        x: Math.random() * (canvasRef.current.width - 40) + 20,
        y: -30,
        speed: difficultyModifier() * 0.8, // Slightly slower for 60fps
        pattern: Math.random() > 0.3 ? 'normal' : Math.random() > 0.5 ? 'zigzag' : 'formation',
    formation: Math.random() > 0.5 ? 'v' : 'line',
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
          
          // Update score - sync with gameState
          const points = Math.floor(10 * state.scoreMultiplier)
          setScore(s => {
            const newScore = s + points
            state.currentScore = newScore // Sync to gameState
            console.log('Score update:', s, '->', newScore)
            return newScore
          })
          setCombo(c => c + 1)
          setKillStreak(k => k + 1)
          
          state.enemies.splice(j, 1)
          state.bullets.splice(i, 1)
          
          break
        }
      }
      
      // Bullet-boss collisions
      if (state.boss && bullet.owner === 'player') {
        const bulletBox = {
          x: bullet.x,
          y: bullet.y,
          width: bullet.width || 5,
          height: bullet.height || 10
        }
        
        const bossBox = {
          x: state.boss.x - state.boss.width / 2,
          y: state.boss.y - state.boss.height / 2,
          width: state.boss.width,
          height: state.boss.height
        }
        
        // Check collision
        if (bulletBox.x < bossBox.x + bossBox.width &&
            bulletBox.x + bulletBox.width > bossBox.x &&
            bulletBox.y < bossBox.y + bossBox.height &&
            bulletBox.y + bulletBox.height > bossBox.y) {
          
          // Boss takes damage
          state.boss.health -= 20
          console.log('Boss hit! Health:', state.boss.health)
          
          // Remove bullet unless it's piercing
          if (!bullet.pierce) {
            state.bullets.splice(i, 1)
          }
          
          // Add hit effect
          playSound('hit', 0.3)
          state.particles.push(...ParticleSystem.createExplosion(bullet.x, bullet.y, '#ff0080', 10))
          
          // Boss defeated?
          if (state.boss.health <= 0) {
            console.log('Boss defeated!')
            playSound('bossSpawn', 0.6)
            // Give bonus score
            const bossPoints = Math.floor(500 * state.scoreMultiplier)
            setScore(s => {
              const newScore = s + bossPoints
              state.currentScore = newScore
              return newScore
            })
            state.boss = null
            state.isBossFight = false
          }
        }
      }
    }

    // Enemy-player collisions
    if (!state.invulnerable && !state.shield) {
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
      
      // Check enemy bullet collisions with player
      for (let i = state.enemyBullets.length - 1; i >= 0; i--) {
        const bullet = state.enemyBullets[i]
        if (bullet.x < state.player.x + state.player.width && 
            bullet.x + 5 > state.player.x &&
            bullet.y < state.player.y + state.player.height && 
            bullet.y + 5 > state.player.y) {
          setHealth(h => {
            const newHealth = h - 20
            if (newHealth <= 0) {
              setLives(l => l - 1)
              state.invulnerable = true
              setTimeout(() => { state.invulnerable = false }, 2000)
              return 100
            }
            return newHealth
          })
          state.enemyBullets.splice(i, 1)
          state.shakeIntensity = 5
          playSound('hit', 0.5)
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
    const timeScale = Math.min(state.deltaTime / 16.67, 2)
    state.powerUps = state.powerUps.filter(powerUp => {
      powerUp.y += powerUp.speed * timeScale
      
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
    const timeScale = Math.min(state.deltaTime / 16.67, 2)
    state.missiles = state.missiles.filter(missile => {
      missile.y -= missile.speed * timeScale
      missile.speed = Math.min(15, missile.speed + 0.5 * timeScale)
      return missile.y > -50 && missile.y < canvasRef.current.height + 50
    })
  }

  const updateEnemyBullets = (state) => {
    const timeScale = Math.min(state.deltaTime / 16.67, 2)
    state.enemyBullets = state.enemyBullets.filter(bullet => {
      bullet.y += bullet.speed * timeScale
      return bullet.y < canvasRef.current.height + 50
    })
  }

  const updatePlasmaBeams = (state) => {
    const timeScale = Math.min(state.deltaTime / 16.67, 2)
    state.plasmaBeams = state.plasmaBeams.filter(beam => {
      beam.y -= 12 * timeScale
      beam.life--
      return beam.life > 0 && beam.y > -50
    })
  }

  
  const updateAsteroids = (state) => {
    const timeScale = Math.min(state.deltaTime / 16.67, 2)
    state.asteroids = state.asteroids.filter(asteroid => {
      asteroid.x += asteroid.vx * timeScale
      asteroid.y += asteroid.vy * timeScale
      asteroid.rotation += 0.02 * timeScale
      
      // Wrap around screen
      if (asteroid.x < -50) asteroid.x = canvasRef.current.width + 50
      if (asteroid.x > canvasRef.current.width + 50) asteroid.x = -50
      if (asteroid.y < -50) asteroid.y = canvasRef.current.height + 50
      if (asteroid.y > canvasRef.current.height + 50) asteroid.y = -50
      
      return true
    })
  }

  const spawnAsteroids = (state) => {
    if (state.enemies.length === 0 && Math.random() < 0.01) {
      const asteroid = {
        x: Math.random() * canvasRef.current.width,
        y: Math.random() * canvasRef.current.height,
        size: 20 + Math.random() * 30,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        rotation: Math.random() * Math.PI * 2,
        health: 2
      }
      state.asteroids.push(asteroid)
    }
  }

  const spawnPowerUps = (state) => {
    const chance = 0.05  // 5% chance per frame - collectibles will spawn
    if (Math.random() < chance && !state.isBossFight && state.powerUps.length < 5) {
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

  
  const drawAsteroids = (ctx, state) => {
    state.asteroids.forEach(asteroid => {
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
    })
  }

  const drawBoss = (ctx, state) => {
    if (!state.boss) return
    
    const time = Date.now() / 1000
    const pulse = Math.sin(time * 2) * 0.1 + 0.9
    const rotation = time * 0.1
    
    ctx.save()
    ctx.translate(state.boss.x, state.boss.y)
    ctx.rotate(rotation)
    ctx.scale(pulse, pulse)
    
    // Main body - hexagonal sci-fi ship
    const gradient = ctx.createLinearGradient(-state.boss.width/2, -state.boss.height/2, state.boss.width/2, state.boss.height/2)
    gradient.addColorStop(0, state.boss.color)
    gradient.addColorStop(0.5, '#000000')
    gradient.addColorStop(1, state.boss.color)
    ctx.fillStyle = gradient
    
    ctx.beginPath()
    // Hexagonal shape
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i
      const x = Math.cos(angle) * state.boss.width / 2
      const y = Math.sin(angle) * state.boss.height / 2
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
    ctx.arc(0, 0, state.boss.width / 4, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
    
    // Weapon arrays
    ctx.strokeStyle = '#00ffff'
    ctx.lineWidth = 2
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI / 4) * i
      const dist = state.boss.width / 2 - 5
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
    ctx.arc(0, 0, state.boss.width / 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0
    
    ctx.restore()
    
    // Boss health bar - better design
    const barWidth = 120
    const barHeight = 10
    const barX = state.boss.x - barWidth / 2
    const barY = state.boss.y - state.boss.height / 2 - 40
    
    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    ctx.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4)
    
    // Red bar
    ctx.fillStyle = '#ff0000'
    ctx.fillRect(barX, barY, barWidth, barHeight)
    
    // Green bar (health)
    const maxHealth = state.boss.maxHealth || state.boss.health
    const healthPercent = state.boss.health / maxHealth
    ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.25 ? '#ffff00' : '#ff0000'
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight)
    
    // Border
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.strokeRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4)
  }

  
  const processGameMode = (state) => {
    if (state.gameMode === 'arcade') {
      // Faster spawns in arcade mode
      state.lastEnemySpawn = Math.max(0, state.lastEnemySpawn - 200)
    } else if (state.gameMode === 'survival') {
      // Endless mode - increase difficulty over time
      if (state.enemiesSpawned % 20 === 0) {
        state.scoreMultiplier += 0.1
      }
    } else if (state.gameMode === 'bossRush') {
      // Spawn bosses more frequently
      if (state.enemiesSpawned % 30 === 0 && !state.isBossFight) {
        state.isBossFight = true
        state.boss = spawnBoss('asteroid', canvasRef.current.width / 2, 100)
      }
    }
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
    // Professional scoreboard background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    ctx.fillRect(0, 0, 200, 280)
    
    // Top border with gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 200, 0)
    bgGradient.addColorStop(0, 'rgba(102, 126, 234, 0.5)')
    bgGradient.addColorStop(1, 'rgba(118, 75, 162, 0.5)')
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, 200, 4)
    
    // Score with glow effect
    ctx.shadowBlur = 10
    ctx.shadowColor = '#4ecdc4'
    ctx.fillStyle = '#4ecdc4'
    ctx.font = 'bold 20px Arial'
    ctx.fillText(`SCORE`, 10, 25)
    ctx.shadowBlur = 0
    
    ctx.font = 'bold 18px Arial'
    ctx.fillStyle = '#fff'
    const currentScore = state.currentScore || score
    console.log('DrawUI score:', currentScore, 'state.currentScore:', state.currentScore, 'React score:', score)
    const scoreText = currentScore.toString().padStart(8, '0')
    ctx.fillText(scoreText, 10, 50)
    
    // Lives indicator
    ctx.fillStyle = '#ff6b6b'
    ctx.font = 'bold 16px Arial'
    ctx.fillText('❤️ × ' + lives, 10, 75)
    
    // High score
    ctx.font = '12px Arial'
    ctx.fillStyle = '#ffff00'
    ctx.fillText(`BEST: ${getPersonalBest().toString().padStart(8, '0')}`, 10, 95)
    
    // Health bar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.fillRect(10, 85, 100, 8)
    const healthPercent = health / 100
    ctx.fillStyle = healthPercent > 0.5 ? '#2ecc71' : healthPercent > 0.25 ? '#f39c12' : '#e74c3c'
    ctx.fillRect(10, 85, 100 * healthPercent, 8)
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 1
    ctx.strokeRect(10, 85, 100, 8)
    
    // Status section
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.fillRect(0, 100, 200, 1)
    
    // Wave and Level
    ctx.font = '14px Arial'
    ctx.fillStyle = '#ffd700'
    ctx.fillText(`Wave: ${wave} | Level: ${level}`, 10, 120)
    
    // Combo with animation
    if (combo > 0) {
      const pulse = Math.sin(Date.now() / 100) * 0.3 + 0.7
      ctx.fillStyle = `rgba(255, 215, 0, ${pulse})`
      ctx.font = 'bold 16px Arial'
      ctx.fillText(`⚡ COMBO × ${combo}`, 10, 145)
    }
    
    // Kills and Coins
    ctx.fillStyle = '#95a5a6'
    ctx.font = '12px Arial'
    ctx.fillText(`Kills: ${killStreak}`, 10, 170)
    ctx.fillText(`💰 ${state.coins}`, 110, 170)
    
    // Current weapon
    ctx.fillStyle = '#4ecdc4'
    ctx.font = 'bold 11px Arial'
    ctx.fillText(`⚔️ ${state.currentWeapon.toUpperCase()}`, 10, 195)
    
    // Power-up indicators with icons
    let yPos = 210
    if (state.shield) {
      ctx.fillStyle = '#00ffff'
      ctx.font = '14px Arial'
      ctx.fillText('🛡️ Shield Active', 10, yPos)
      yPos += 18
    }
    if (state.rapidFire) {
      ctx.fillStyle = '#ff6b6b'
      ctx.font = '14px Arial'
      ctx.fillText('⚡ Rapid Fire', 10, yPos)
      yPos += 18
    }
    if (state.slowMotion) {
      ctx.fillStyle = '#9b59b6'
      ctx.font = '14px Arial'
      ctx.fillText('⏰ Slow Motion', 10, yPos)
      yPos += 18
    }
    if (state.coinDoubler) {
      ctx.fillStyle = '#2ecc71'
      ctx.font = '14px Arial'
      ctx.fillText('💰 Score Doubler', 10, yPos)
      yPos += 18
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

