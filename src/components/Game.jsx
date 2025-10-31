import { useEffect, useRef, useState, useCallback } from 'react'
import './Game.css'
import { ParticleSystem } from '../utils/particles'
import { powerUpTypes, createPowerUp, applyPowerUp } from '../utils/powerups'
import { achievements, checkAchievement } from '../utils/achievements'
import { bossTypes, spawnBoss, updateBossPattern, loadBossImages, getBossImage } from '../utils/bosses'
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
  const [unlockedAchievements, setUnlockedAchievements] = useState([])
  const [enemiesKilled, setEnemiesKilled] = useState(0)
  const [timePlayed, setTimePlayed] = useState(0)
  const [scoreMultiplier, setScoreMultiplier] = useState(1)
  
  // Game state
  const gameState = useRef({
    keys: {},
    player: { x: 400, y: 550, width: 40, height: 40, speed: 5 },
    enemies: [],
    bullets: [],
    currentScore: 0,
    isTouching: false,
    touchShootTimer: 0,
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
    
    // Load boss images
    loadBossImages()
    
    // Set canvas size to full viewport
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    
    updateCanvasSize()
    
    // Update canvas size on window resize
    window.addEventListener('resize', updateCanvasSize)
    
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
      e.stopPropagation()
      
      if (!e.touches || e.touches.length === 0) return
      
      const touch = e.touches[0]
      const rect = canvas.getBoundingClientRect()
      const touchX = touch.clientX - rect.left
      const touchY = touch.clientY - rect.top
      
      // Convert screen coords to canvas coords
      const canvasX = (touchX / rect.width) * canvas.width
      const canvasY = (touchY / rect.height) * canvas.height
      
      // Constrain to canvas bounds
      gameState.current.player.x = Math.max(0, Math.min(canvas.width - gameState.current.player.width, canvasX - gameState.current.player.width / 2))
      gameState.current.player.y = Math.max(0, Math.min(canvas.height - gameState.current.player.height, canvasY - gameState.current.player.height / 2))
      
      // Enable rapid fire on touch
      gameState.current.isTouching = true
      gameState.current.touchShootTimer = Date.now()
      
      // Shoot on touch
      shootBullet(gameState.current)
    }

    const handleTouchMove = (e) => {
      e.preventDefault()
      e.stopPropagation()
      
      if (!e.touches || e.touches.length === 0) return
      
      const touch = e.touches[0]
      const rect = canvas.getBoundingClientRect()
      const touchX = touch.clientX - rect.left
      const touchY = touch.clientY - rect.top
      
      const canvasX = (touchX / rect.width) * canvas.width
      const canvasY = (touchY / rect.height) * canvas.height
      
      gameState.current.player.x = Math.max(0, Math.min(canvas.width - gameState.current.player.width, canvasX - gameState.current.player.width / 2))
      gameState.current.player.y = Math.max(0, Math.min(canvas.height - gameState.current.player.height, canvasY - gameState.current.player.height / 2))
      
      // Keep isTouching true while moving (timer is managed in game loop)
      gameState.current.isTouching = true
    }
    
    const handleTouchEnd = () => {
      gameState.current.isTouching = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
      window.removeEventListener('resize', updateCanvasSize)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      canvas.removeEventListener('touchstart', handleTouchStart)
      canvas.removeEventListener('touchmove', handleTouchMove)
      canvas.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isPaused, onPause])

  const gameLoop = useCallback((currentTime) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
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
    
    // Handle rapid fire on touch for mobile (iOS fix) - ALWAYS fire when touching
    if (state.isTouching) {
      const now = Date.now()
      // Every 50ms shoot a bullet
      if (now - state.touchShootTimer >= 50) {
        shootBullet(state)
        state.touchShootTimer = now
      }
    }

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
      onGameOver(score, wave, level, killStreak, combo)
      return
    }
    
    // Save score when game ends
    if (lives <= 0 && score > 0) {
      try {
        import('../utils/scoreTracking').then(module => {
          module.saveScore(score)
        }).catch(error => {
          console.error('Failed to save score:', error)
        })
      } catch (error) {
        console.error('Failed to import score tracking:', error)
      }
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
    const canvas = canvasRef.current
    if (!canvas) return
    
    const speed = state.slowMotion ? state.player.speed * 0.5 : state.player.speed
    const timeScale = Math.min(state.deltaTime / 16.67, 2) // Cap at 2x speed for stability
    
    if (state.keys['a'] || state.keys['A'] || state.keys['ArrowLeft']) state.player.x = Math.max(20, state.player.x - speed * timeScale)
    if (state.keys['d'] || state.keys['D'] || state.keys['ArrowRight']) state.player.x = Math.min(canvas.width - state.player.width - 20, state.player.x + speed * timeScale)
    if (state.keys['w'] || state.keys['W'] || state.keys['ArrowUp']) state.player.y = Math.max(50, state.player.y - speed * timeScale)
    if (state.keys['s'] || state.keys['S'] || state.keys['ArrowDown']) state.player.y = Math.min(canvas.height - state.player.height - 20, state.player.y + speed * timeScale)
    
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
      case 'laserRifle':
      case 'weapon_laser':
        state.bullets.push({ ...baseBullet, x: state.player.x + state.player.width / 2, color: '#00ffff' })
        break
      case 'spread':
      case 'weapon_spread':
        state.bullets.push({ ...baseBullet, x: state.player.x + state.player.width / 2, color: '#ffd700' })
        state.bullets.push({ ...baseBullet, x: state.player.x - 10, angle: -0.3, color: '#ffd700' })
        state.bullets.push({ ...baseBullet, x: state.player.x + 20, angle: 0.3, color: '#ffd700' })
        break
      case 'plasma':
      case 'plasmaRifle':
      case 'weapon_plasma':
      case 'weapon_plasma_rifle':
        state.plasmaBeams.push({ x: state.player.x, y: state.player.y, width: 8, height: 15, life: 50 })
        break
      case 'missile':
      case 'rocket':
      case 'weapon_missile':
      case 'weapon_rocket':
        state.missiles.push({ x: state.player.x, y: state.player.y, speed: 8, target: null, explosion: false })
        playSound('missile', 0.3)
        break
      case 'shotgun':
      case 'weapon_shotgun':
        for (let i = 0; i < 5; i++) {
          state.bullets.push({ ...baseBullet, x: state.player.x + i * 8, angle: (i - 2) * 0.2, color: '#ff6347' })
        }
        break
      case 'minigun':
      case 'machinegun':
      case 'weapon_minigun':
      case 'weapon_machinegun':
        state.bullets.push({ ...baseBullet, x: state.player.x + state.player.width / 2, color: '#e74c3c' })
        state.bullets.push({ ...baseBullet, x: state.player.x + state.player.width / 2 + 5, speed: 12, color: '#e74c3c' })
        break
      case 'flamethrower':
      case 'fireMode':
      case 'weapon_fire':
      case 'weapon_flamethrower':
        for (let i = 0; i < 3; i++) {
          state.bullets.push({ ...baseBullet, x: state.player.x + i * 10, angle: (i - 1) * 0.15, color: '#ff4500' })
        }
        break
      case 'freeze':
      case 'weapon_freeze':
      case 'ice':
      case 'weapon_ice':
        state.bullets.push({ ...baseBullet, x: state.player.x + state.player.width / 2, color: '#00bfff', freeze: true })
        break
      case 'electric':
      case 'lightning':
      case 'weapon_electric':
      case 'weapon_lightning':
        state.bullets.push({ ...baseBullet, x: state.player.x + state.player.width / 2, speed: 15, color: '#ffff00' })
        for (let i = 0; i < 3; i++) {
          state.bullets.push({ ...baseBullet, x: state.player.x + i * 15, angle: (i - 1) * 0.1, color: '#ffff00' })
        }
        break
      case 'poison':
      case 'weapon_poison':
        state.bullets.push({ ...baseBullet, x: state.player.x + state.player.width / 2, color: '#7bff00', poison: true })
        break
      case 'explosive':
      case 'weapon_explosive':
        state.bullets.push({ ...baseBullet, x: state.player.x + state.player.width / 2, color: '#ff8c00', explosive: true })
        break
      case 'piercing':
      case 'weapon_piercing':
        state.bullets.push({ ...baseBullet, x: state.player.x + state.player.width / 2, pierce: true, color: '#9370db' })
        break
      case 'homing':
      case 'weapon_homing':
        const nearestEnemy = state.enemies[0]
        state.missiles.push({ x: state.player.x, y: state.player.y, speed: 8, target: nearestEnemy, explosion: false, homing: true })
        break
      case 'bounce':
      case 'weapon_bounce':
        state.bullets.push({ ...baseBullet, x: state.player.x + state.player.width / 2, bounce: true, color: '#00ff00' })
        break
      case 'beam':
      case 'laserBeam':
      case 'weapon_beam':
      case 'weapon_laserBeam':
        state.bullets.push({ ...baseBullet, x: state.player.x + state.player.width / 2, width: 15, height: 20, speed: 15, color: '#00ff00' })
        break
      case 'cluster':
      case 'grenade':
      case 'weapon_cluster':
      case 'weapon_grenade':
        state.missiles.push({ x: state.player.x, y: state.player.y, speed: 8, cluster: true, explosion: false })
        break
      case 'flak':
      case 'weapon_flak':
        for (let i = 0; i < 4; i++) {
          state.bullets.push({ ...baseBullet, x: state.player.x + i * 10, angle: (i - 1.5) * 0.4, color: '#e67e22' })
        }
        break
      case 'railgun':
      case 'sniper':
      case 'weapon_railgun':
      case 'weapon_sniper':
        state.bullets.push({ ...baseBullet, x: state.player.x + state.player.width / 2, width: 8, height: 25, speed: 20, color: '#3498db' })
        break
      case 'shockwave':
      case 'weapon_shockwave':
        for (let i = 0; i < 8; i++) {
          const angle = (Math.PI * 2 / 8) * i
          state.bullets.push({ ...baseBullet, x: state.player.x, y: state.player.y, vx: Math.cos(angle) * 8, vy: Math.sin(angle) * 8, color: '#1abc9c' })
        }
        break
      case 'cryo':
      case 'weapon_cryo':
        state.bullets.push({ ...baseBullet, x: state.player.x + state.player.width / 2, color: '#3498db', cryo: true })
        break
      case 'acid':
      case 'weapon_acid':
        for (let i = 0; i < 3; i++) {
          state.bullets.push({ ...baseBullet, x: state.player.x + i * 10, angle: (i - 1) * 0.2, color: '#2ecc71', acid: true })
        }
        break
      case 'volcano':
      case 'weapon_volcano':
        for (let i = 0; i < 5; i++) {
          state.bullets.push({ ...baseBullet, x: state.player.x + i * 8, angle: (i - 2) * 0.3, color: '#e67e22', explosive: true })
        }
        break
      case 'ultimate':
      case 'weapon_ultimate':
        // Ultimate weapon - combination of multiple types
        for (let i = 0; i < 12; i++) {
          const angle = (Math.PI * 2 / 12) * i
          state.bullets.push({ ...baseBullet, x: state.player.x, y: state.player.y, vx: Math.cos(angle) * 10, vy: Math.sin(angle) * 10, 
                               width: 10, height: 15, color: '#ff1493', pierce: true })
        }
        state.missiles.push({ x: state.player.x, y: state.player.y, speed: 10, target: null, explosion: true })
        break
      default:
        state.bullets.push({ ...baseBullet, x: state.player.x + state.player.width / 2 })
    }
    
    // Add muzzle flash particle
    state.particles.push(...ParticleSystem.createExplosion(state.player.x + state.player.width / 2, state.player.y, '#ffd700', 5))
  }

  const updateBullets = (state) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const timeScale = Math.min(state.deltaTime / 16.67, 2)
    state.bullets = state.bullets.filter(bullet => {
      bullet.y -= bullet.speed * timeScale
      return bullet.y > -10 && bullet.y < canvas.height + 10
    })
  }

  const updateEnemies = (state) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const timeScale = Math.min(state.deltaTime / 16.67, 2)
    state.enemies = state.enemies.filter(enemy => {
      enemy.y += enemy.speed * timeScale
      
      // Simple movement patterns
      if (enemy.pattern === 'zigzag') {
        enemy.x += Math.sin(enemy.y / 20) * 2 * timeScale
      }
      
      // Make enemies shoot more frequently!
      if (Math.random() < 0.01 && enemy.y > 50 && enemy.y < canvas.height - 100) {
        state.enemyBullets.push({
          x: enemy.x + 15,
          y: enemy.y + 30,
          speed: 3 * timeScale,
          owner: 'enemy',
          width: 3,
          height: 8
        })
      }
      
      return enemy.y < canvas.height + 50
    })
  }

  const spawnEnemies = (state) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const now = Date.now()
    const spawnRate = 2000 / difficultyModifier() // Slower spawn rate
    if (now - state.lastEnemySpawn > spawnRate) {
      const enemy = {
        x: Math.random() * (canvas.width - 30) + 15,
        y: -30,
        speed: difficultyModifier() * 1.2, // Faster movement
        pattern: Math.random() > 0.5 ? 'normal' : 'zigzag',
        health: 1,
        type: 'shooter' // All enemies can shoot
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
    // Bullet-enemy collisions - use safer iteration
    const bulletsToRemove = []
    const enemiesToRemove = []
    
    for (let i = 0; i < state.bullets.length; i++) {
      const bullet = state.bullets[i]
      if (bullet.owner !== 'player') continue
      
      for (let j = 0; j < state.enemies.length; j++) {
        const enemy = state.enemies[j]
        
        // Use bullet's actual width and height (with defaults for compatibility)
        const bulletWidth = bullet.width || 5
        const bulletHeight = bullet.height || 10
        const enemyWidth = 30
        const enemyHeight = 30
        
        if (bullet.x < enemy.x + enemyWidth && bullet.x + bulletWidth > enemy.x &&
            bullet.y < enemy.y + enemyHeight && bullet.y + bulletHeight > enemy.y) {
          
          // Update score - sync with gameState
          const points = Math.floor(10 * state.scoreMultiplier)
          setScore(s => {
            const newScore = s + points
            state.currentScore = newScore // Sync to gameState
            
            // Check achievements
            if (enemiesKilled === 0) {
              const achievement = checkAchievement('firstKill', setUnlockedAchievements)
              if (achievement) {
                playSound('achievement', 1.0)
              }
            }
            
            return newScore
          })
          
          const newCombo = combo + 1
          setCombo(newCombo)
          setKillStreak(k => k + 1)
          setEnemiesKilled(e => e + 1)
          
          // Check achievements
          if (newCombo >= 10 && !achievements.combo10.unlocked) {
            const achievement = checkAchievement('combo10', setUnlockedAchievements)
            if (achievement) {
              playSound('achievement', 1.0)
            }
          }
          
          if (enemiesKilled === 100) {
            const achievement = checkAchievement('survivor', setUnlockedAchievements)
            if (achievement) {
              playSound('achievement', 1.0)
            }
          }
          
          enemiesToRemove.push(j)
          bulletsToRemove.push(i)
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
          
          // Remove bullet unless it's piercing
          if (!bullet.pierce) {
            bulletsToRemove.push(i)
          }
          
          // Add hit effect
          playSound('hit', 0.3)
          state.particles.push(...ParticleSystem.createExplosion(bullet.x, bullet.y, '#ff0080', 10))
          
          // Boss defeated?
          if (state.boss.health <= 0) {
            playSound('bossSpawn', 0.6)
            // Give bonus score
            const bossPoints = Math.floor(500 * state.scoreMultiplier)
            setScore(s => {
              const newScore = s + bossPoints
              state.currentScore = newScore
              
              // Check for perfect boss achievement (no damage)
              if (health >= 100) {
                const achievement = checkAchievement('noDamageBoss', setUnlockedAchievements)
                if (achievement) {
                  playSound('achievement', 1.0)
                }
              }
              
              return newScore
            })
            state.boss = null
            state.isBossFight = false
          }
        }
      }
    }
    
    // Remove bullets and enemies safely (in reverse order to maintain indices)
    bulletsToRemove.sort((a, b) => b - a).forEach(index => {
      state.bullets.splice(index, 1)
    })
    enemiesToRemove.sort((a, b) => b - a).forEach(index => {
      state.enemies.splice(index, 1)
    })

    // Enemy-player collisions
    if (!state.invulnerable && !state.shield) {
      const enemiesToRemove = []
      
      for (let i = 0; i < state.enemies.length; i++) {
        const enemy = state.enemies[i]
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
          enemiesToRemove.push(i)
          break
        }
      }
      
      // Remove enemies safely (in reverse order)
      enemiesToRemove.sort((a, b) => b - a).forEach(index => {
        state.enemies.splice(index, 1)
      })
      
      // Check enemy bullet collisions with player
      const bulletsToRemove = []
      for (let i = 0; i < state.enemyBullets.length; i++) {
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
          bulletsToRemove.push(i)
          state.shakeIntensity = 5
          playSound('hit', 0.5)
        }
      }
      
      // Remove bullets safely (in reverse order)
      bulletsToRemove.sort((a, b) => b - a).forEach(index => {
        state.enemyBullets.splice(index, 1)
      })
    }
  }

  // Draw functions - removed duplicate

  const drawPlayer = (ctx, state) => {
    ctx.save()
    
    const shipColor = selectedShip === 'kaden' ? '#4ecdc4' : '#ff6b6b'
    const accentColor = selectedShip === 'kaden' ? '#00ffff' : '#ff00ff'
    
    if (state.invulnerable) {
      ctx.globalAlpha = 0.5
    }
    
    // Glow effect
    ctx.shadowBlur = 20
    ctx.shadowColor = shipColor
    
    // Main body
    ctx.fillStyle = shipColor
    ctx.beginPath()
    ctx.moveTo(state.player.x + state.player.width / 2, state.player.y)
    ctx.lineTo(state.player.x + state.player.width, state.player.y + state.player.height - 10)
    ctx.lineTo(state.player.x + state.player.width * 0.8, state.player.y + state.player.height)
    ctx.lineTo(state.player.x + state.player.width * 0.2, state.player.y + state.player.height)
    ctx.lineTo(state.player.x, state.player.y + state.player.height - 10)
    ctx.closePath()
    ctx.fill()
    
    // Accent details
    ctx.fillStyle = accentColor
    ctx.fillRect(state.player.x + state.player.width * 0.35, state.player.y + state.player.height * 0.5, 
                  state.player.width * 0.3, state.player.height * 0.3)
    
    // Engine glow
    const engineGlow = ctx.createLinearGradient(
      state.player.x + state.player.width * 0.35, 
      state.player.y + state.player.height,
      state.player.x + state.player.width * 0.65,
      state.player.y + state.player.height
    )
    engineGlow.addColorStop(0, 'yellow')
    engineGlow.addColorStop(0.5, shipColor)
    engineGlow.addColorStop(1, 'yellow')
    ctx.fillStyle = engineGlow
    ctx.fillRect(state.player.x + state.player.width * 0.25, state.player.y + state.player.height * 0.9,
                 state.player.width * 0.5, state.player.height * 0.1)
    
    // Wing details
    ctx.strokeStyle = accentColor
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(state.player.x + state.player.width * 0.3, state.player.y + state.player.height * 0.6)
    ctx.lineTo(state.player.x, state.player.y + state.player.height * 0.8)
    ctx.moveTo(state.player.x + state.player.width * 0.7, state.player.y + state.player.height * 0.6)
    ctx.lineTo(state.player.x + state.player.width, state.player.y + state.player.height * 0.8)
    ctx.stroke()
    
    if (state.shield) {
      ctx.strokeStyle = 'cyan'
      ctx.lineWidth = 3
      ctx.globalAlpha = 0.5
      ctx.beginPath()
      ctx.arc(state.player.x + state.player.width / 2, state.player.y + state.player.height / 2, 30, 0, Math.PI * 2)
      ctx.stroke()
      ctx.globalAlpha = 1
    }
    
    ctx.restore()
  }

  const drawBullets = (ctx, state) => {
    state.bullets.forEach(bullet => {
      const color = bullet.color || (bullet.owner === 'player' ? 'cyan' : 'red')
      
      // Apply special effects based on weapon type
      if (bullet.freeze) {
        ctx.strokeStyle = '#00bfff'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(bullet.x, bullet.y, bullet.width, 0, Math.PI * 2)
        ctx.stroke()
      }
      
      ctx.fillStyle = color
      ctx.fillRect(bullet.x, bullet.y, bullet.width || 5, bullet.height || 10)
      
      // Add glow effect for special weapons
      if (bullet.pierce || bullet.explosive) {
        ctx.globalAlpha = 0.5
        ctx.shadowBlur = 10
        ctx.shadowColor = color
        ctx.fillRect(bullet.x, bullet.y, bullet.width || 5, bullet.height || 10)
        ctx.globalAlpha = 1
        ctx.shadowBlur = 0
      }
    })
  }

  const drawEnemies = (ctx, state) => {
    state.enemies.forEach(enemy => {
      ctx.save()
      
      // Simple red triangle enemies
      ctx.fillStyle = '#ff0000' // Bright red
      ctx.strokeStyle = '#cc0000' // Darker red outline
      ctx.lineWidth = 2
      
      // Draw triangle pointing down
      ctx.beginPath()
      ctx.moveTo(enemy.x + 15, enemy.y) // Top point
      ctx.lineTo(enemy.x + 5, enemy.y + 25) // Bottom left
      ctx.lineTo(enemy.x + 25, enemy.y + 25) // Bottom right
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      
      // Add a small cockpit detail
      ctx.fillStyle = '#ff6666'
      ctx.beginPath()
      ctx.arc(enemy.x + 15, enemy.y + 8, 3, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.restore()
    })
  }

  const drawPowerUps = (ctx, state) => {
    state.powerUps.forEach(powerUp => {
      const time = Date.now() / 1000
      powerUp.pulse = powerUp.pulse || 0
      powerUp.pulse += 0.1
      powerUp.rotation = powerUp.rotation || 0
      powerUp.rotation += 0.05
      
      ctx.save()
      
      const pulseScale = 1 + Math.sin(powerUp.pulse) * 0.2
      const glowIntensity = 0.7 + Math.sin(powerUp.pulse * 2) * 0.3
      
      // Outer glow effect
      const gradient = ctx.createRadialGradient(powerUp.x, powerUp.y, 0, powerUp.x, powerUp.y, 30)
      gradient.addColorStop(0, powerUp.color)
      gradient.addColorStop(0.3, powerUp.color + '00')
      gradient.addColorStop(1, 'transparent')
      
      ctx.globalAlpha = glowIntensity * 0.5
      ctx.fillStyle = gradient
      ctx.fillRect(powerUp.x - 30, powerUp.y - 30, 60, 60)
      ctx.globalAlpha = 1
      
      // Main body with rotating shape
      ctx.translate(powerUp.x, powerUp.y)
      ctx.scale(pulseScale, pulseScale)
      ctx.rotate(powerUp.rotation)
      
      // Draw outer ring
      ctx.strokeStyle = powerUp.color
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(0, 0, powerUp.width / 2 + 3, 0, Math.PI * 2)
      ctx.stroke()
      
      // Draw inner shape
      ctx.fillStyle = powerUp.color
      ctx.beginPath()
      ctx.moveTo(0, -powerUp.width / 2)
      ctx.lineTo(powerUp.width / 2, 0)
      ctx.lineTo(0, powerUp.width / 2)
      ctx.lineTo(-powerUp.width / 2, 0)
      ctx.closePath()
      ctx.fill()
      
      // Inner glow core
      const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, powerUp.width / 3)
      coreGradient.addColorStop(0, '#ffffff')
      coreGradient.addColorStop(1, powerUp.color)
      ctx.fillStyle = coreGradient
      ctx.beginPath()
      ctx.arc(0, 0, powerUp.width / 4, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.restore()
      
      // Draw icon with better positioning
      ctx.save()
      ctx.font = 'bold 28px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#ffffff'
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = 2
      ctx.strokeText(powerUp.icon, powerUp.x, powerUp.y)
      ctx.fillText(powerUp.icon, powerUp.x, powerUp.y)
      ctx.restore()
      
      // Draw trails
      ctx.strokeStyle = powerUp.color
      ctx.lineWidth = 2
      ctx.globalAlpha = 0.5
      ctx.beginPath()
      ctx.moveTo(powerUp.x, powerUp.y - 15)
      ctx.lineTo(powerUp.x, powerUp.y - 35)
      ctx.stroke()
      ctx.globalAlpha = 1
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
    const canvas = canvasRef.current
    if (!canvas) return
    
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
      
      return powerUp.y < canvas.height + 50
    })
  }

  const updateParticles = (state) => {
    // Optimized: Limit particle count to 200 for performance
    state.particles = state.particles.slice(0, 200).filter(p => p.life > 0)
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
    const canvas = canvasRef.current
    if (!canvas) return
    
    const timeScale = Math.min(state.deltaTime / 16.67, 2)
    state.missiles = state.missiles.filter(missile => {
      missile.y -= missile.speed * timeScale
      missile.speed = Math.min(15, missile.speed + 0.5 * timeScale)
      return missile.y > -50 && missile.y < canvas.height + 50
    })
  }

  const updateEnemyBullets = (state) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const timeScale = Math.min(state.deltaTime / 16.67, 2)
    state.enemyBullets = state.enemyBullets.filter(bullet => {
      bullet.y += bullet.speed * timeScale
      return bullet.y < canvas.height + 50
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
    const canvas = canvasRef.current
    if (!canvas) return
    
    const timeScale = Math.min(state.deltaTime / 16.67, 2)
    state.asteroids = state.asteroids.filter(asteroid => {
      asteroid.x += asteroid.vx * timeScale
      asteroid.y += asteroid.vy * timeScale
      asteroid.rotation += 0.02 * timeScale
      
      // Wrap around screen
      if (asteroid.x < -50) asteroid.x = canvas.width + 50
      if (asteroid.x > canvas.width + 50) asteroid.x = -50
      if (asteroid.y < -50) asteroid.y = canvas.height + 50
      if (asteroid.y > canvas.height + 50) asteroid.y = -50
      
      return true
    })
  }

  const spawnAsteroids = (state) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    if (state.enemies.length === 0 && Math.random() < 0.01) {
      const asteroid = {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
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
    const canvas = canvasRef.current
    if (!canvas) return
    
    const chance = 0.05  // 5% chance per frame - collectibles will spawn
    if (Math.random() < chance && !state.isBossFight && state.powerUps.length < 5) {
      const x = Math.random() * (canvas.width - 50) + 25
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
    const canvas = canvasRef.current
    if (!canvas) return
    
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    drawStarfield(ctx, state.backgroundOffset)
    state.backgroundOffset += 0.5
  }

  const drawStarfield = (ctx, offset = 0) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    // Optimized: Reduced star count from 150 to 80 for better performance
    ctx.fillStyle = 'white'
    const canvasWidth = canvas.width
    const canvasHeight = canvas.height
    for (let i = 0; i < 80; i++) {
      const x = (i * 83) % canvasWidth
      const y = ((i * 73) % canvasHeight) + (offset % canvasHeight)
      const brightness = Math.random()
      ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`
      ctx.fillRect(x, y, 1 + brightness, 1 + brightness)
    }
  }

  const drawBackgroundElements = (ctx, state) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    // Draw nebula gradients
    const gradient = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      50,
      canvas.width / 2,
      canvas.height / 2,
      300
    )
    gradient.addColorStop(0, 'rgba(255, 107, 107, 0.1)')
    gradient.addColorStop(0.5, 'rgba(78, 205, 196, 0.1)')
    gradient.addColorStop(1, 'transparent')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)
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
    
    // Try to load and use boss ship image
    const bossImg = getBossImage(state.boss.type || 'asteroid')
    
    ctx.save()
    ctx.translate(state.boss.x, state.boss.y)
    
    if (bossImg && bossImg.width) {
      // Draw using loaded image
      ctx.rotate(rotation)
      ctx.globalAlpha = 0.9 + Math.sin(time * 3) * 0.1
      ctx.drawImage(bossImg, -state.boss.width / 2, -state.boss.height / 2, state.boss.width, state.boss.height)
      ctx.globalAlpha = 1
    } else {
      // Enhanced fallback boss design
      ctx.rotate(rotation)
      ctx.scale(pulse, pulse)
      
      // Outer glow ring
      ctx.shadowBlur = 30
      ctx.shadowColor = state.boss.color
      ctx.strokeStyle = state.boss.color
      ctx.lineWidth = 5
      ctx.beginPath()
      ctx.arc(0, 0, state.boss.width / 2 + 10, 0, Math.PI * 2)
      ctx.stroke()
      ctx.shadowBlur = 0
      
      // Main body - hexagonal sci-fi ship
      const gradient = ctx.createLinearGradient(-state.boss.width/2, -state.boss.height/2, state.boss.width/2, state.boss.height/2)
      gradient.addColorStop(0, state.boss.color)
      gradient.addColorStop(0.3, state.boss.color + '80')
      gradient.addColorStop(0.5, '#000000')
      gradient.addColorStop(0.7, state.boss.color + '80')
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
      
      // Outer rim
      ctx.strokeStyle = '#ffff00'
      ctx.lineWidth = 4
      ctx.stroke()
      
      // Inner energy core
      const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, state.boss.width / 4)
      coreGradient.addColorStop(0, '#ffffff')
      coreGradient.addColorStop(0.5, '#ff0080')
      coreGradient.addColorStop(1, state.boss.color)
      ctx.fillStyle = coreGradient
      ctx.globalAlpha = 0.8 + Math.sin(time * 4) * 0.2
      ctx.beginPath()
      ctx.arc(0, 0, state.boss.width / 4, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1
      
      // Weapon arrays with enhanced design
      ctx.strokeStyle = '#00ffff'
      ctx.lineWidth = 3
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI / 4) * i
        const dist = state.boss.width / 2 - 5
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(Math.cos(angle) * dist, Math.sin(angle) * dist)
        ctx.stroke()
        
        // Turret mounts
        const turretX = Math.cos(angle) * (dist - 10)
        const turretY = Math.sin(angle) * (dist - 10)
        ctx.fillStyle = '#444444'
        ctx.beginPath()
        ctx.arc(turretX, turretY, 4, 0, Math.PI * 2)
        ctx.fill()
      }
      
      // Pulsing center glow
      ctx.shadowBlur = 25
      ctx.shadowColor = state.boss.color
      ctx.fillStyle = state.boss.color
      ctx.globalAlpha = 0.6 + Math.sin(time * 5) * 0.4
      ctx.beginPath()
      ctx.arc(0, 0, state.boss.width / 6, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
      ctx.globalAlpha = 1
    }
    
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
    const canvas = canvasRef.current
    if (!canvas) return
    
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
        state.boss = spawnBoss('asteroid', canvas.width / 2, 100)
      }
    }
  }

  const checkLevelProgression = (state) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    if (state.enemiesSpawned % 50 === 0 && state.enemiesSpawned > 0) {
      state.wave++
      setWave(state.wave)
      if (state.wave === 5) {
        state.level++
        setLevel(state.level)
        state.isBossFight = true
        state.boss = spawnBoss('asteroid', canvas.width / 2, 100)
      }
    }
  }

  const drawUI = (ctx, state) => {
    // Professional scoreboard background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    ctx.fillRect(0, 0, 200, 340)
    
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
    
    // Health bar (moved below high score to prevent overlap)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.fillRect(10, 110, 100, 8)
    const healthPercent = health / 100
    ctx.fillStyle = healthPercent > 0.5 ? '#2ecc71' : healthPercent > 0.25 ? '#f39c12' : '#e74c3c'
    ctx.fillRect(10, 110, 100 * healthPercent, 8)
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 1
    ctx.strokeRect(10, 110, 100, 8)
    
    // Status section
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.fillRect(0, 130, 200, 1)
    
    // Wave and Level
    ctx.font = '14px Arial'
    ctx.fillStyle = '#ffd700'
    ctx.fillText(`Wave: ${wave} | Level: ${level}`, 10, 150)
    
    // Combo with animation
    if (combo > 0) {
      const pulse = Math.sin(Date.now() / 100) * 0.3 + 0.7
      ctx.fillStyle = `rgba(255, 215, 0, ${pulse})`
      ctx.font = 'bold 16px Arial'
      ctx.fillText(`⚡ COMBO × ${combo}`, 10, 175)
    }
    
    // Kills and Coins
    ctx.fillStyle = '#95a5a6'
    ctx.font = '12px Arial'
    ctx.fillText(`Kills: ${killStreak}`, 10, 200)
    ctx.fillText(`💰 ${state.coins}`, 110, 200)
    
    // Current weapon
    ctx.fillStyle = '#4ecdc4'
    ctx.font = 'bold 11px Arial'
    ctx.fillText(`⚔️ ${state.currentWeapon.toUpperCase()}`, 10, 225)
    
    // Power-up indicators with icons
    let yPos = 240
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

