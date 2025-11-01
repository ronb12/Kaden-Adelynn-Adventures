import { useEffect, useRef, useState, useCallback } from 'react'
import './Game.css'
import { ParticleSystem } from '../utils/particles'
import { powerUpTypes, createPowerUp, applyPowerUp } from '../utils/powerups'
import { achievements, checkAchievement } from '../utils/achievements'
import {
  bossTypes,
  spawnBoss,
  updateBossPattern,
  loadBossImages,
  getBossImage,
} from '../utils/bosses'
import { enemyVarieties, spawnEnemy, updateEnemyMovement } from '../utils/enemyTypes'
import { sounds, playSound } from '../utils/sounds'
import { getPersonalBest, saveScore } from '../utils/scoreTracking'
import { playGameplayMusic, playBossMusic, stopMusic } from '../utils/music'

function Game({
  onPause,
  onGameOver,
  difficulty,
  selectedShip,
  selectedCharacter,
  playerName,
  isPaused,
}) {
  const canvasRef = useRef(null)
  const gameLoopRef = useRef(null)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(25)
  const [health, setHealth] = useState(100)
  const healthRef = useRef(100)
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
    currentKills: 0,
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
    bossShootTimer: 0,
    gameMode: 'classic', // classic, arcade, survival, bossRush
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
    deltaTime: 16.67, // 60fps = 16.67ms per frame
  })

  // Keep a ref in sync with health so the canvas UI reads the latest value inside the gameLoop closure
  useEffect(() => {
    healthRef.current = health
  }, [health])

  useEffect(() => {
    // Gamepad support
    const controllerEnabled = (localStorage.getItem('controllerEnabled') || 'true') === 'true'
    if (!controllerEnabled) return
    let rafId
    const deadzone = parseFloat(localStorage.getItem('controllerDeadzone') || '0.2')
    const applyDeadzone = (v) => (Math.abs(v) < deadzone ? 0 : v)
    const poll = () => {
      const pads = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(Boolean) : []
      if (pads.length) {
        const p = pads[0]
        if (p) {
          const axX = applyDeadzone(p.axes?.[0] || 0)
          const axY = applyDeadzone(p.axes?.[1] || 0)
          // D-pad
          const dLeft = p.buttons?.[14]?.pressed ? -1 : 0
          const dRight = p.buttons?.[15]?.pressed ? 1 : 0
          const dUp = p.buttons?.[12]?.pressed ? -1 : 0
          const dDown = p.buttons?.[13]?.pressed ? 1 : 0
          const moveX = Math.max(-1, Math.min(1, axX + dLeft + dRight))
          const moveY = Math.max(-1, Math.min(1, axY + dUp + dDown))
          // set player intent
          playerInput.current = playerInput.current || { x: 0, y: 0, firing: false }
          playerInput.current.x = moveX
          playerInput.current.y = moveY
          // Fire: A (0) or RT (7)
          const fire = !!(p.buttons?.[0]?.pressed || p.buttons?.[7]?.pressed)
          playerInput.current.firing = fire
          // Pause: Start (9)
          if (p.buttons?.[9]?.pressed && !pauseLatch.current) {
            pauseLatch.current = true
            togglePause()
          } else if (!p.buttons?.[9]?.pressed) {
            pauseLatch.current = false
          }
        }
      }
      rafId = requestAnimationFrame(poll)
    }
    const pauseLatch = { current: false }
    const togglePause = () => {
      if (typeof onPause === 'function') onPause()
    }
    poll()
    return () => cancelAnimationFrame(rafId)
  }, [])

  // Use playerInput in update loop if present
  const playerInput = useRef({ x: 0, y: 0, firing: false })
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
    // Start music only after a user gesture to satisfy autoplay policies
    const startMusicOnGesture = () => {
      playGameplayMusic()
      window.removeEventListener('pointerdown', startMusicOnGesture)
      window.removeEventListener('keydown', startMusicOnGesture)
      window.removeEventListener('touchstart', startMusicOnGesture)
    }
    window.addEventListener('pointerdown', startMusicOnGesture, { once: true })
    window.addEventListener('keydown', startMusicOnGesture, { once: true })
    window.addEventListener('touchstart', startMusicOnGesture, { once: true, passive: true })

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
      gameState.current.player.x = Math.max(
        0,
        Math.min(
          canvas.width - gameState.current.player.width,
          canvasX - gameState.current.player.width / 2
        )
      )
      gameState.current.player.y = Math.max(
        0,
        Math.min(
          canvas.height - gameState.current.player.height,
          canvasY - gameState.current.player.height / 2
        )
      )

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

      gameState.current.player.x = Math.max(
        0,
        Math.min(
          canvas.width - gameState.current.player.width,
          canvasX - gameState.current.player.width / 2
        )
      )
      gameState.current.player.y = Math.max(
        0,
        Math.min(
          canvas.height - gameState.current.player.height,
          canvasY - gameState.current.player.height / 2
        )
      )

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
      stopMusic()
      window.removeEventListener('resize', updateCanvasSize)
      window.removeEventListener('pointerdown', startMusicOnGesture)
      window.removeEventListener('keydown', startMusicOnGesture)
      window.removeEventListener('touchstart', startMusicOnGesture)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      canvas.removeEventListener('touchstart', handleTouchStart)
      canvas.removeEventListener('touchmove', handleTouchMove)
      canvas.removeEventListener('touchend', handleTouchEnd)
    }
  }, [])

  // Apply character-specific traits
  useEffect(() => {
    const state = gameState.current
    if (!state) return
    const traits = {
      kaden: { speed: 5, weapon: 'laser', healthBonus: 0, damageMul: 1.0 },
      adelynn: { speed: 6, weapon: 'spread', healthBonus: -10, damageMul: 0.9 },
      hero3: { speed: 5, weapon: 'plasma', healthBonus: 10, damageMul: 1.1 },
      hero4: { speed: 6, weapon: 'electric', healthBonus: 0, damageMul: 1.0 },
      hero5: { speed: 4, weapon: 'shotgun', healthBonus: 20, damageMul: 1.2 },
      hero6: { speed: 5, weapon: 'homing', healthBonus: 0, damageMul: 1.0 },
      hero7: { speed: 4, weapon: 'railgun', healthBonus: 20, damageMul: 1.3 },
      hero8: { speed: 6, weapon: 'beam', healthBonus: -10, damageMul: 0.9 },
      hero9: { speed: 5, weapon: 'missile', healthBonus: 10, damageMul: 1.1 },
      hero10: { speed: 5, weapon: 'freeze', healthBonus: 0, damageMul: 1.0 },
    }
    const t = traits[selectedCharacter] || traits.kaden
    state.player.speed = t.speed
    state.currentWeapon = t.weapon
    // apply health bonus once at start of play session
    setHealth((h) => Math.max(1, Math.min(100, h + t.healthBonus)))
    state.damageMul = t.damageMul
    // Apply store upgrades
    const upShield = localStorage.getItem('upgrade_shield') === '1'
    const upSpeed = localStorage.getItem('upgrade_speed') === '1'
    const upRapid = localStorage.getItem('upgrade_rapid') === '1'
    const upLife = localStorage.getItem('upgrade_life') === '1'
    const upDoubler = localStorage.getItem('upgrade_doubler') === '1'
    if (upShield) { state.shield = true; state.shieldTimer = 600 }
    if (upSpeed) { state.player.speed = (state.player.speed || 5) + 1 }
    if (upRapid) { state.rapidFire = true; state.rapidFireTimer = 600 }
    if (upLife) { setLives((l) => l + 1) }
    if (upDoubler) { state.coinDoubler = true; state.coinDoublerTimer = 9999 }
  }, [selectedCharacter])

  // Daily challenge modifier
  useEffect(() => {
    const state = gameState.current
    if (!state) return
    const override = localStorage.getItem('challengeOverride')
    if (override !== null) {
      const val = parseInt(override, 10)
      if (!Number.isNaN(val)) {
        state.dailyChallenge = Math.max(0, Math.min(2, val))
        return
      }
    }
    const daySeed = new Date().toISOString().slice(0, 10)
    const hash = Array.from(daySeed).reduce((a, c) => (((a << 5) - a) + c.charCodeAt(0)) | 0, 0)
    state.dailyChallenge = Math.abs(hash) % 3 // 0..2
  }, [])

  const gameLoop = useCallback(
    (currentTime) => {
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
        ctx.translate(
          (Math.random() - 0.5) * state.shakeIntensity,
          (Math.random() - 0.5) * state.shakeIntensity
        )
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
          saveScore(score, playerName || 'Player')
        } catch (_) {}
      }

      setTimePlayed((t) => t + 1)

      if (!isPaused) {
        gameLoopRef.current = requestAnimationFrame(gameLoop)
      }
    },
    [isPaused, lives, onGameOver]
  )

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

    if (state.keys['a'] || state.keys['A'] || state.keys['ArrowLeft'])
      state.player.x = Math.max(20, state.player.x - speed * timeScale)
    if (state.keys['d'] || state.keys['D'] || state.keys['ArrowRight'])
      state.player.x = Math.min(
        canvas.width - state.player.width - 20,
        state.player.x + speed * timeScale
      )
    if (state.keys['w'] || state.keys['W'] || state.keys['ArrowUp'])
      state.player.y = Math.max(50, state.player.y - speed * timeScale)
    if (state.keys['s'] || state.keys['S'] || state.keys['ArrowDown'])
      state.player.y = Math.min(
        canvas.height - state.player.height - 20,
        state.player.y + speed * timeScale
      )
    // Gamepad analog
    if (playerInput.current) {
      const ax = playerInput.current.x || 0
      const ay = playerInput.current.y || 0
      if (ax < 0) state.player.x = Math.max(20, state.player.x + ax * speed * timeScale)
      if (ax > 0)
        state.player.x = Math.min(
          canvas.width - state.player.width - 20,
          state.player.x + ax * speed * timeScale
        )
      if (ay < 0) state.player.y = Math.max(50, state.player.y + ay * speed * timeScale)
      if (ay > 0)
        state.player.y = Math.min(
          canvas.height - state.player.height - 20,
          state.player.y + ay * speed * timeScale
        )
    }

    // Shoot bullets
    const now = Date.now()
    const fireRate = state.rapidFire ? 100 : 200
    const padFire = playerInput.current?.firing
    if (
      (state.keys[' '] || state.keys['Spacebar'] || padFire) &&
      now - state.lastBulletShot > fireRate
    ) {
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
      height: 10,
    }

    switch (state.currentWeapon) {
      case 'laser':
      case 'laserRifle':
      case 'weapon_laser':
        state.bullets.push({
          ...baseBullet,
          x: state.player.x + state.player.width / 2,
          color: '#00ffff',
        })
        break
      case 'spread':
      case 'weapon_spread':
        state.bullets.push({
          ...baseBullet,
          x: state.player.x + state.player.width / 2,
          color: '#ffd700',
        })
        state.bullets.push({ ...baseBullet, x: state.player.x - 10, angle: -0.3, color: '#ffd700' })
        state.bullets.push({ ...baseBullet, x: state.player.x + 20, angle: 0.3, color: '#ffd700' })
        break
      case 'plasma':
      case 'plasmaRifle':
      case 'weapon_plasma':
      case 'weapon_plasma_rifle':
        state.plasmaBeams.push({
          x: state.player.x,
          y: state.player.y,
          width: 8,
          height: 15,
          life: 50,
        })
        break
      case 'missile':
      case 'rocket':
      case 'weapon_missile':
      case 'weapon_rocket':
        state.missiles.push({
          x: state.player.x,
          y: state.player.y,
          speed: 8,
          target: null,
          explosion: false,
        })
        playSound('missile', 0.3)
        break
      case 'shotgun':
      case 'weapon_shotgun':
        for (let i = 0; i < 5; i++) {
          state.bullets.push({
            ...baseBullet,
            x: state.player.x + i * 8,
            angle: (i - 2) * 0.2,
            color: '#ff6347',
          })
        }
        break
      case 'minigun':
      case 'machinegun':
      case 'weapon_minigun':
      case 'weapon_machinegun':
        state.bullets.push({
          ...baseBullet,
          x: state.player.x + state.player.width / 2,
          color: '#e74c3c',
        })
        state.bullets.push({
          ...baseBullet,
          x: state.player.x + state.player.width / 2 + 5,
          speed: 12,
          color: '#e74c3c',
        })
        break
      case 'flamethrower':
      case 'fireMode':
      case 'weapon_fire':
      case 'weapon_flamethrower':
        for (let i = 0; i < 3; i++) {
          state.bullets.push({
            ...baseBullet,
            x: state.player.x + i * 10,
            angle: (i - 1) * 0.15,
            color: '#ff4500',
          })
        }
        break
      case 'freeze':
      case 'weapon_freeze':
      case 'ice':
      case 'weapon_ice':
        state.bullets.push({
          ...baseBullet,
          x: state.player.x + state.player.width / 2,
          color: '#00bfff',
          freeze: true,
        })
        break
      case 'electric':
      case 'lightning':
      case 'weapon_electric':
      case 'weapon_lightning':
        state.bullets.push({
          ...baseBullet,
          x: state.player.x + state.player.width / 2,
          speed: 15,
          color: '#ffff00',
        })
        for (let i = 0; i < 3; i++) {
          state.bullets.push({
            ...baseBullet,
            x: state.player.x + i * 15,
            angle: (i - 1) * 0.1,
            color: '#ffff00',
          })
        }
        break
      case 'poison':
      case 'weapon_poison':
        state.bullets.push({
          ...baseBullet,
          x: state.player.x + state.player.width / 2,
          color: '#7bff00',
          poison: true,
        })
        break
      case 'explosive':
      case 'weapon_explosive':
        state.bullets.push({
          ...baseBullet,
          x: state.player.x + state.player.width / 2,
          color: '#ff8c00',
          explosive: true,
        })
        break
      case 'piercing':
      case 'weapon_piercing':
        state.bullets.push({
          ...baseBullet,
          x: state.player.x + state.player.width / 2,
          pierce: true,
          color: '#9370db',
        })
        break
      case 'homing':
      case 'weapon_homing': {
        const nearestEnemy = state.enemies[0]
        state.missiles.push({
          x: state.player.x,
          y: state.player.y,
          speed: 8,
          target: nearestEnemy,
          explosion: false,
          homing: true,
        })
        break
      }
      case 'bounce':
      case 'weapon_bounce':
        state.bullets.push({
          ...baseBullet,
          x: state.player.x + state.player.width / 2,
          bounce: true,
          color: '#00ff00',
        })
        break
      case 'beam':
      case 'laserBeam':
      case 'weapon_beam':
      case 'weapon_laserBeam':
        state.bullets.push({
          ...baseBullet,
          x: state.player.x + state.player.width / 2,
          width: 15,
          height: 20,
          speed: 15,
          color: '#00ff00',
        })
        break
      case 'cluster':
      case 'grenade':
      case 'weapon_cluster':
      case 'weapon_grenade':
        state.missiles.push({
          x: state.player.x,
          y: state.player.y,
          speed: 8,
          cluster: true,
          explosion: false,
        })
        break
      case 'flak':
      case 'weapon_flak':
        for (let i = 0; i < 4; i++) {
          state.bullets.push({
            ...baseBullet,
            x: state.player.x + i * 10,
            angle: (i - 1.5) * 0.4,
            color: '#e67e22',
          })
        }
        break
      case 'railgun':
      case 'sniper':
      case 'weapon_railgun':
      case 'weapon_sniper':
        state.bullets.push({
          ...baseBullet,
          x: state.player.x + state.player.width / 2,
          width: 8,
          height: 25,
          speed: 20,
          color: '#3498db',
        })
        break
      case 'shockwave':
      case 'weapon_shockwave':
        for (let i = 0; i < 8; i++) {
          const angle = ((Math.PI * 2) / 8) * i
          state.bullets.push({
            ...baseBullet,
            x: state.player.x,
            y: state.player.y,
            vx: Math.cos(angle) * 8,
            vy: Math.sin(angle) * 8,
            color: '#1abc9c',
          })
        }
        break
      case 'cryo':
      case 'weapon_cryo':
        state.bullets.push({
          ...baseBullet,
          x: state.player.x + state.player.width / 2,
          color: '#3498db',
          cryo: true,
        })
        break
      case 'acid':
      case 'weapon_acid':
        for (let i = 0; i < 3; i++) {
          state.bullets.push({
            ...baseBullet,
            x: state.player.x + i * 10,
            angle: (i - 1) * 0.2,
            color: '#2ecc71',
            acid: true,
          })
        }
        break
      case 'volcano':
      case 'weapon_volcano':
        for (let i = 0; i < 5; i++) {
          state.bullets.push({
            ...baseBullet,
            x: state.player.x + i * 8,
            angle: (i - 2) * 0.3,
            color: '#e67e22',
            explosive: true,
          })
        }
        break
      case 'ultimate':
      case 'weapon_ultimate':
        // Ultimate weapon - combination of multiple types
        for (let i = 0; i < 12; i++) {
          const angle = ((Math.PI * 2) / 12) * i
          state.bullets.push({
            ...baseBullet,
            x: state.player.x,
            y: state.player.y,
            vx: Math.cos(angle) * 10,
            vy: Math.sin(angle) * 10,
            width: 10,
            height: 15,
            color: '#ff1493',
            pierce: true,
          })
        }
        state.missiles.push({
          x: state.player.x,
          y: state.player.y,
          speed: 10,
          target: null,
          explosion: true,
        })
        break
      default:
        state.bullets.push({ ...baseBullet, x: state.player.x + state.player.width / 2 })
    }

    // Add muzzle flash particle
    state.particles.push(
      ...ParticleSystem.createExplosion(
        state.player.x + state.player.width / 2,
        state.player.y,
        '#ffd700',
        5
      )
    )
  }

  const updateBullets = (state) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const timeScale = Math.min(state.deltaTime / 16.67, 2)
    state.bullets = state.bullets.filter((bullet) => {
      // store previous position for swept collision
      bullet.prevX = bullet.x
      bullet.prevY = bullet.y
      // Support directional bullets
      if (typeof bullet.vx === 'number' || typeof bullet.vy === 'number') {
        bullet.x += (bullet.vx || 0) * timeScale
        bullet.y += (bullet.vy || -bullet.speed) * timeScale
      } else if (typeof bullet.angle === 'number') {
        // Angle is in radians; 0 means up
        const dx = Math.sin(bullet.angle) * bullet.speed
        const dy = -Math.cos(bullet.angle) * bullet.speed
        bullet.x += dx * timeScale
        bullet.y += dy * timeScale
      } else {
        bullet.y -= bullet.speed * timeScale
      }
      return (
        bullet.y > -20 &&
        bullet.y < canvas.height + 20 &&
        bullet.x > -20 &&
        bullet.x < canvas.width + 20
      )
    })
  }

  const updateEnemies = (state) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const timeScale = Math.min(state.deltaTime / 16.67, 2)
    state.enemies = state.enemies.filter((enemy) => {
      enemy.y += enemy.speed * timeScale

      // Simple movement patterns
      if (enemy.pattern === 'zigzag') {
        enemy.x += Math.sin(enemy.y / 20) * 2 * timeScale
      } else if (enemy.pattern === 'sway') {
        enemy.x += Math.sin(enemy.y / 30) * 3 * timeScale
      } else if (enemy.pattern === 'dash') {
        if (Math.random() < 0.02) enemy.y += 20 * timeScale
      }

      // Make enemies shoot more frequently!
      if (Math.random() < 0.01 && enemy.y > 50 && enemy.y < canvas.height - 100) {
        state.enemyBullets.push({
          x: enemy.x + 15,
          y: enemy.y + 30,
          speed: 3 * timeScale,
          owner: 'enemy',
          width: 3,
          height: 8,
        })
      }

      return enemy.y < canvas.height + 50
    })
  }

  const spawnEnemies = (state) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const now = Date.now()
    const baseRate = state.wave <= 2 ? 2600 : state.wave <= 4 ? 2200 : 1800
    let spawnRate = baseRate / difficultyModifier()
    if (state.dailyChallenge === 0) spawnRate *= 0.8
    if (now - state.lastEnemySpawn > spawnRate) {
      const patternsEarly = ['normal', 'zigzag']
      const patternsMore = ['normal', 'zigzag', 'sway', 'dash']
      const pool = state.wave < 3 ? patternsEarly : patternsMore
      const pattern = pool[Math.floor(Math.random() * pool.length)]
      // Mix silver with red from the start; slightly higher chance as waves progress
      const baseSilverChance = state.wave >= 4 ? 0.4 : 0.25
      const periodicSilver = state.enemiesSpawned > 0 && state.enemiesSpawned % 10 === 0
      const isSilver = periodicSilver || Math.random() < baseSilverChance
      const enemy = {
        x: Math.random() * (canvas.width - 30) + 15,
        y: -30,
        speed: difficultyModifier() * (isSilver ? 0.95 : state.wave < 3 ? 1.0 : 1.3) * (state.dailyChallenge === 0 ? 1.2 : 1.0),
        pattern,
        health: isSilver ? 4 : state.wave < 3 ? 1 : 2,
        type: isSilver ? 'silver' : 'red',
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
    const asteroidsToRemove = []

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

        if (
          bullet.x < enemy.x + enemyWidth &&
          bullet.x + bulletWidth > enemy.x &&
          bullet.y < enemy.y + enemyHeight &&
          bullet.y + bulletHeight > enemy.y
        ) {
          // Update score - sync with gameState
          const points = Math.floor(10 * state.scoreMultiplier)
          setScore((s) => {
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
          setKillStreak((k) => k + 1)
          setEnemiesKilled((e) => e + 1)
          state.currentKills = (state.currentKills || 0) + 1

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

          // Apply damage; tougher enemies survive
          const dmg = Math.max(1, Math.round(state.damageMul || 1))
          enemy.health = (typeof enemy.health === 'number' ? enemy.health : 1) - dmg
          // Remove bullet unless piercing
          if (!bullet.pierce) bulletsToRemove.push(i)
          if (enemy.health <= 0) {
            enemiesToRemove.push(j)
            state.particles.push(
              ...ParticleSystem.createExplosion(enemy.x + 15, enemy.y + 15, '#ff6666', 12)
            )
          }
          break
        }
      }

      // Bullet-boss collisions (swept)
      if (state.boss && bullet.owner === 'player') {
        const bossBox = {
          x: state.boss.x - state.boss.width / 2,
          y: state.boss.y - state.boss.height / 2,
          width: state.boss.width,
          height: state.boss.height,
        }
        const bw = bullet.width || 5
        const bh = bullet.height || 10
        const px = bullet.prevX ?? bullet.x
        const py = bullet.prevY ?? bullet.y
        const dx = bullet.x - px
        const dy = bullet.y - py
        const dist = Math.hypot(dx, dy)
        const steps = Math.max(1, Math.ceil(dist / 4))
        let bossHit = false
        for (let s = 0; s <= steps; s++) {
          const ix = px + (dx * s) / steps
          const iy = py + (dy * s) / steps
          if (
            ix < bossBox.x + bossBox.width &&
            ix + bw > bossBox.x &&
            iy < bossBox.y + bossBox.height &&
            iy + bh > bossBox.y
          ) {
            bossHit = true
            break
          }
        }
        if (bossHit) {
          // Boss takes damage
          state.boss.health -= Math.max(10, 20 * (state.damageMul || 1))

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
            setScore((s) => {
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

      // Bullet-asteroid collisions (swept circle-rect)
      if (state.asteroids && state.asteroids.length > 0 && bullet.owner === 'player') {
        for (let a = 0; a < state.asteroids.length; a++) {
          const asteroid = state.asteroids[a]
          const r = Math.max(10, asteroid.size) // radius
          const cx = asteroid.x
          const cy = asteroid.y
          const bw = bullet.width || 5
          const bh = bullet.height || 10
          const px = bullet.prevX ?? bullet.x
          const py = bullet.prevY ?? bullet.y
          const dxSeg = bullet.x - px
          const dySeg = bullet.y - py
          const dist = Math.hypot(dxSeg, dySeg)
          const steps = Math.max(1, Math.ceil(dist / 4))
          let hit = false
          for (let s = 0; s <= steps; s++) {
            const ix = px + (dxSeg * s) / steps
            const iy = py + (dySeg * s) / steps
            const closestX = Math.max(ix, Math.min(cx, ix + bw))
            const closestY = Math.max(iy, Math.min(cy, iy + bh))
            const dx = cx - closestX
            const dy = cy - closestY
            if (dx * dx + dy * dy <= r * r) {
              hit = true
              break
            }
          }
          if (hit) {
            // damage asteroid
            asteroid.health =
              (typeof asteroid.health === 'number' ? asteroid.health : 2) - (state.damageMul || 1)
            // remove bullet unless piercing
            if (!bullet.pierce) bulletsToRemove.push(i)
            playSound('hit', 0.3)
            state.particles.push(
              ...ParticleSystem.createExplosion(bullet.x, bullet.y, '#ffa502', 8)
            )
            if (asteroid.health <= 0) {
              // split into smaller pieces
              splitAsteroid(state, asteroid)
              asteroidsToRemove.push(a)
              state.particles.push(
                ...ParticleSystem.createExplosion(asteroid.x, asteroid.y, '#ffa502', 20)
              )
              state.coins += 5
              setCoins((c) => c + 5)
              // add score for asteroid destroyed
              const asteroidPoints = 10
              setScore((s) => {
                const ns = s + asteroidPoints
                state.currentScore = ns
                return ns
              })
            }
            break
          }
        }
      }
    }

    // Remove bullets and enemies safely (in reverse order to maintain indices)
    bulletsToRemove
      .sort((a, b) => b - a)
      .forEach((index) => {
        state.bullets.splice(index, 1)
      })
    enemiesToRemove
      .sort((a, b) => b - a)
      .forEach((index) => {
        state.enemies.splice(index, 1)
      })

    // Remove destroyed asteroids
    asteroidsToRemove
      .sort((a, b) => b - a)
      .forEach((index) => {
        state.asteroids.splice(index, 1)
      })

    // Missiles-enemy collisions (for missile/rocket weapons)
    if (state.missiles && state.missiles.length > 0 && state.enemies.length > 0) {
      const missilesToRemove = []
      for (let mi = 0; mi < state.missiles.length; mi++) {
        const m = state.missiles[mi]
        for (let j = 0; j < state.enemies.length; j++) {
          const enemy = state.enemies[j]
          const enemyWidth = 30
          const enemyHeight = 30
          if (
            m.x < enemy.x + enemyWidth &&
            m.x + 6 > enemy.x &&
            m.y < enemy.y + enemyHeight &&
            m.y + 12 > enemy.y
          ) {
            // Explosion feedback
            playSound('hit', 0.5)
            state.particles.push(
              ...ParticleSystem.createExplosion(enemy.x + 15, enemy.y + 15, '#ff8c00', 15)
            )
            enemiesToRemove.push(j)
            missilesToRemove.push(mi)
            break
          }
        }
      }
      // Remove missiles and enemies
      missilesToRemove
        .sort((a, b) => b - a)
        .forEach((index) => {
          state.missiles.splice(index, 1)
        })
      enemiesToRemove
        .sort((a, b) => b - a)
        .forEach((index) => {
          state.enemies.splice(index, 1)
        })
    }

    // Plasma beams-enemy collisions (for plasma weapons)
    if (state.plasmaBeams && state.plasmaBeams.length > 0 && state.enemies.length > 0) {
      const beamsToRemove = []
      for (let bi = 0; bi < state.plasmaBeams.length; bi++) {
        const beam = state.plasmaBeams[bi]
        for (let j = 0; j < state.enemies.length; j++) {
          const enemy = state.enemies[j]
          const enemyBox = { x: enemy.x, y: enemy.y, w: 30, h: 30 }
          const beamBox = { x: beam.x, y: beam.y, w: beam.width || 8, h: beam.height || 15 }
          if (
            beamBox.x < enemyBox.x + enemyBox.w &&
            beamBox.x + beamBox.w > enemyBox.x &&
            beamBox.y < enemyBox.y + enemyBox.h &&
            beamBox.y + beamBox.h > enemyBox.y
          ) {
            playSound('hit', 0.4)
            state.particles.push(
              ...ParticleSystem.createExplosion(enemy.x + 15, enemy.y + 15, '#00ffff', 10)
            )
            enemiesToRemove.push(j)
            // beams can persist; optionally remove after a hit
          }
        }
      }
      // Remove enemies hit by beams
      enemiesToRemove
        .sort((a, b) => b - a)
        .forEach((index) => {
          state.enemies.splice(index, 1)
        })
    }

    // Enemy-player collisions
    if (!state.invulnerable && !state.shield) {
      const enemiesToRemove = []

      for (let i = 0; i < state.enemies.length; i++) {
        const enemy = state.enemies[i]
        if (
          state.player.x < enemy.x + 30 &&
          state.player.x + state.player.width > enemy.x &&
          state.player.y < enemy.y + 30 &&
          state.player.y + state.player.height > enemy.y
        ) {
          setHealth((h) => {
            const newHealth = h - 1
            if (newHealth <= 0) {
              setLives((l) => Math.max(0, l - 1))
              state.invulnerable = true
              setTimeout(() => { state.invulnerable = false }, 2000)
              const canvas = canvasRef.current
              if (canvas) {
                state.player.x = Math.max(20, canvas.width / 2 - state.player.width / 2)
                state.player.y = Math.max(50, canvas.height - state.player.height - 60)
              }
              state.enemyBullets = []
              return 100
            }
            return newHealth
          })
          enemiesToRemove.push(i)
          break
        }
      }

      // Remove enemies safely (in reverse order)
      enemiesToRemove
        .sort((a, b) => b - a)
        .forEach((index) => {
          state.enemies.splice(index, 1)
        })

      // Check enemy bullet collisions with player (bullets are drawn centered)
      const bulletsToRemove = []
      for (let i = 0; i < state.enemyBullets.length; i++) {
        const bullet = state.enemyBullets[i]
        const size = (bullet.width && bullet.height)
          ? Math.max(bullet.width, bullet.height)
          : (bullet.width || bullet.height || 10)
        const r = size / 2
        const bx = (bullet.x || 0) - r
        const by = (bullet.y || 0) - r
        const bw = r * 2
        const bh = r * 2
        if (
          bx < state.player.x + state.player.width &&
          bx + bw > state.player.x &&
          by < state.player.y + state.player.height &&
          by + bh > state.player.y
        ) {
          setHealth((h) => {
            const newHealth = h - 1
            console.log('HIT by enemy bullet. Health:', h, '->', Math.max(0, newHealth))
            if (newHealth <= 0) {
              setLives((l) => Math.max(0, l - 1))
              state.invulnerable = true
              setTimeout(() => { state.invulnerable = false }, 2000)
              const canvas = canvasRef.current
              if (canvas) {
                state.player.x = Math.max(20, canvas.width / 2 - state.player.width / 2)
                state.player.y = Math.max(50, canvas.height - state.player.height - 60)
              }
              state.enemyBullets = []
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
      bulletsToRemove
        .sort((a, b) => b - a)
        .forEach((index) => {
          state.enemyBullets.splice(index, 1)
        })
    }
    // Missiles-asteroid collisions
    if (state.missiles && state.missiles.length > 0 && state.asteroids.length > 0) {
      const missilesToRemove2 = []
      const astToRemove2 = []
      for (let mi = 0; mi < state.missiles.length; mi++) {
        const m = state.missiles[mi]
        for (let a = 0; a < state.asteroids.length; a++) {
          const ast = state.asteroids[a]
          const r = Math.max(10, ast.size)
          const dx = ast.x - m.x
          const dy = ast.y - m.y
          if (dx * dx + dy * dy <= (r + 6) * (r + 6)) {
            missilesToRemove2.push(mi)
            ast.health = (typeof ast.health === 'number' ? ast.health : 2) - 2
            state.particles.push(...ParticleSystem.createExplosion(ast.x, ast.y, '#ff8c00', 20))
            if (ast.health <= 0) {
              splitAsteroid(state, ast)
              astToRemove2.push(a)
              const asteroidPoints = 10
              setScore((s) => {
                const ns = s + asteroidPoints
                state.currentScore = ns
                return ns
              })
            }
            break
          }
        }
      }
      missilesToRemove2.sort((a, b) => b - a).forEach((i) => state.missiles.splice(i, 1))
      astToRemove2.sort((a, b) => b - a).forEach((i) => state.asteroids.splice(i, 1))
    }

    // Plasma beams-asteroid collisions
    if (state.plasmaBeams && state.plasmaBeams.length > 0 && state.asteroids.length > 0) {
      const astToRemove3 = []
      for (let bi = 0; bi < state.plasmaBeams.length; bi++) {
        const beam = state.plasmaBeams[bi]
        const bx = beam.x
        const by = beam.y
        const bw = beam.width || 8
        const bh = beam.height || 15
        for (let a = 0; a < state.asteroids.length; a++) {
          const ast = state.asteroids[a]
          const r = Math.max(10, ast.size)
          const cx = ast.x
          const cy = ast.y
          const closestX = Math.max(bx, Math.min(cx, bx + bw))
          const closestY = Math.max(by, Math.min(cy, by + bh))
          const dx = cx - closestX
          const dy = cy - closestY
          if (dx * dx + dy * dy <= r * r) {
            ast.health = (typeof ast.health === 'number' ? ast.health : 2) - 1
            state.particles.push(...ParticleSystem.createExplosion(cx, cy, '#00ffff', 10))
            if (ast.health <= 0) {
              splitAsteroid(state, ast)
              astToRemove3.push(a)
              const asteroidPoints = 10
              setScore((s) => {
                const ns = s + asteroidPoints
                state.currentScore = ns
                return ns
              })
            }
          }
        }
      }
      astToRemove3.sort((a, b) => b - a).forEach((i) => state.asteroids.splice(i, 1))
    }
  }

  // Draw functions - removed duplicate

  const drawPlayer = (ctx, state) => {
    ctx.save()

    let shipColor = '#4ecdc4'
    let accentColor = '#00ffff'
    if (selectedCharacter === 'adelynn') {
      shipColor = '#ff6b9a'
      accentColor = '#ff00ff'
    } else if (selectedShip !== 'kaden') {
      shipColor = '#ff6b6b'
      accentColor = '#ff00ff'
    }

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
    ctx.fillRect(
      state.player.x + state.player.width * 0.35,
      state.player.y + state.player.height * 0.5,
      state.player.width * 0.3,
      state.player.height * 0.3
    )

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
    ctx.fillRect(
      state.player.x + state.player.width * 0.25,
      state.player.y + state.player.height * 0.9,
      state.player.width * 0.5,
      state.player.height * 0.1
    )

    // Wing details
    ctx.strokeStyle = accentColor
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(
      state.player.x + state.player.width * 0.3,
      state.player.y + state.player.height * 0.6
    )
    ctx.lineTo(state.player.x, state.player.y + state.player.height * 0.8)
    ctx.moveTo(
      state.player.x + state.player.width * 0.7,
      state.player.y + state.player.height * 0.6
    )
    ctx.lineTo(state.player.x + state.player.width, state.player.y + state.player.height * 0.8)
    ctx.stroke()

    if (state.shield) {
      ctx.strokeStyle = 'cyan'
      ctx.lineWidth = 3
      ctx.globalAlpha = 0.5
      ctx.beginPath()
      ctx.arc(
        state.player.x + state.player.width / 2,
        state.player.y + state.player.height / 2,
        30,
        0,
        Math.PI * 2
      )
      ctx.stroke()
      ctx.globalAlpha = 1
    }

    ctx.restore()
  }

  const drawBullets = (ctx, state) => {
    state.bullets.forEach((bullet) => {
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
    state.enemies.forEach((enemy) => {
      ctx.save()
      const isSilver = enemy.type === 'silver'
      if (isSilver) {
        // Silver enemy: metallic gradient triangle
        const grad = ctx.createLinearGradient(enemy.x, enemy.y, enemy.x + 30, enemy.y + 30)
        grad.addColorStop(0, '#c0c0c0')
        grad.addColorStop(0.5, '#8f8f8f')
        grad.addColorStop(1, '#e0e0e0')
        ctx.fillStyle = grad
        ctx.strokeStyle = '#9e9e9e'
        ctx.lineWidth = 2.5
      } else {
        // Red enemy
        ctx.fillStyle = '#ff0000'
        ctx.strokeStyle = '#cc0000'
        ctx.lineWidth = 2
      }

      // Draw triangle pointing down
      ctx.beginPath()
      ctx.moveTo(enemy.x + 15, enemy.y) // Top point
      ctx.lineTo(enemy.x + 5, enemy.y + 25) // Bottom left
      ctx.lineTo(enemy.x + 25, enemy.y + 25) // Bottom right
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      // Cockpit detail
      ctx.fillStyle = isSilver ? '#d5d5d5' : '#ff6666'
      ctx.beginPath()
      ctx.arc(enemy.x + 15, enemy.y + 8, 3, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()
    })
  }

  const drawPowerUps = (ctx, state) => {
    state.powerUps.forEach((powerUp) => {
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
    state.particles.forEach((particle) => {
      ctx.fillStyle = particle.color
      ctx.fillRect(particle.x, particle.y, 2, 2)
    })
  }

  const drawWingFighters = (ctx, state) => {
    state.wingFighters.forEach((fighter) => {
      ctx.fillStyle = '#95a5a6'
      ctx.fillRect(fighter.x, fighter.y, 20, 20)
    })
  }

  const updatePowerUps = (state) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const timeScale = Math.min(state.deltaTime / 16.67, 2)
    state.powerUps = state.powerUps.filter((powerUp) => {
      powerUp.y += powerUp.speed * timeScale

      // Check collision with player
      if (
        state.player.x < powerUp.x + powerUp.width &&
        state.player.x + state.player.width > powerUp.x &&
        state.player.y < powerUp.y + powerUp.height &&
        state.player.y + state.player.height > powerUp.y
      ) {
        applyPowerUp(state, powerUp)
        playSound('powerup', 0.5)
        state.powerUps.splice(state.powerUps.indexOf(powerUp), 1)
        state.coins += 10
        setCoins((c) => c + 10)
        return false
      }

      return powerUp.y < canvas.height + 50
    })
  }

  const updateParticles = (state) => {
    // Optimized: Limit particle count to 200 for performance
    state.particles = state.particles.slice(0, 200).filter((p) => p.life > 0)
    state.particles.forEach((p) => p.life--)
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
    state.missiles = state.missiles.filter((missile) => {
      missile.y -= missile.speed * timeScale
      missile.speed = Math.min(15, missile.speed + 0.5 * timeScale)
      return missile.y > -50 && missile.y < canvas.height + 50
    })
  }

  const updateEnemyBullets = (state) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const timeScale = Math.min(state.deltaTime / 16.67, 2)
    state.enemyBullets = state.enemyBullets.filter((bullet) => {
      bullet.y += bullet.speed * timeScale
      return bullet.y < canvas.height + 50
    })
  }

  const updatePlasmaBeams = (state) => {
    const timeScale = Math.min(state.deltaTime / 16.67, 2)
    state.plasmaBeams = state.plasmaBeams.filter((beam) => {
      beam.y -= 12 * timeScale
      beam.life--
      return beam.life > 0 && beam.y > -50
    })
  }

  const updateAsteroids = (state) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const timeScale = Math.min(state.deltaTime / 16.67, 2)
    state.asteroids = state.asteroids.filter((asteroid) => {
      // Foreground asteroids fall like enemies and can be destroyed
      // vx small drift, vy is main downward speed
      asteroid.x += (asteroid.vx || 0) * timeScale
      asteroid.y += asteroid.vy || 1.2 * timeScale
      asteroid.rotation += 0.02 * timeScale
      // Despawn once out of screen
      return asteroid.y < canvas.height + 60
    })
  }

  const splitAsteroid = (state, asteroid) => {
    // Only split if big enough
    const minSize = 18
    if (!asteroid || (asteroid.size || 0) <= minSize) return
    const pieces = 2 + Math.floor(Math.random() * 2) // 2-3 pieces
    const newSize = Math.max(minSize - 4, Math.floor(asteroid.size / 2))
    for (let i = 0; i < pieces; i++) {
      const angle = (Math.PI * 2 * i) / pieces + Math.random() * 0.5
      const speed = 1 + Math.random() * 1.2
      const vx = Math.cos(angle) * speed
      const vy = Math.sin(angle) * speed + 0.6
      state.asteroids.push({
        x: asteroid.x + Math.cos(angle) * 6,
        y: asteroid.y + Math.sin(angle) * 6,
        size: newSize,
        vx,
        vy,
        rotation: Math.random() * Math.PI * 2,
        health: 1 + Math.floor(newSize / 22),
      })
    }
  }

  const spawnAsteroids = (state) => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Timed spawns similar to enemies (foreground threats)
    const now = Date.now()
    const baseRate = 2800 / difficultyModifier()
    if (!state.lastAsteroidSpawn) state.lastAsteroidSpawn = 0
    if (now - state.lastAsteroidSpawn > baseRate) {
      const size = 24 + Math.random() * 36
      const asteroid = {
        x: Math.random() * (canvas.width - 2 * size) + size,
        y: -size,
        size,
        vx: (Math.random() - 0.5) * 0.8, // slight drift
        vy: 1.2 + Math.random() * 0.8, // downward speed
        rotation: Math.random() * Math.PI * 2,
        health: 2 + Math.floor(size / 20),
      }
      state.asteroids.push(asteroid)
      state.lastAsteroidSpawn = now
    }
  }

  const spawnPowerUps = (state) => {
    const canvas = canvasRef.current
    if (!canvas) return

    let chance = 0.05 // 5% chance per frame - collectibles will spawn
    if (state.dailyChallenge === 2) chance *= 2
    if (Math.random() < chance && !state.isBossFight && state.powerUps.length < 5) {
      const x = Math.random() * (canvas.width - 50) + 25
      const y = -30
      state.powerUps.push(createPowerUp(x, y))
    }
  }

  const updateBoss = (state) => {
    if (state.boss) {
      const time = Date.now()
      // Movement: oscillate and bounce horizontally
      const canvas = canvasRef.current
      if (canvas) {
        state.boss.x += Math.sin(time / 500) * 1.5
        if (state.boss.x < 80) state.boss.x = 80
        if (state.boss.x > canvas.width - 80) state.boss.x = canvas.width - 80
      }
      // Shooting: aimed bursts toward player from multiple gun mounts
      state.bossShootTimer = (state.bossShootTimer || 0) + 1
      if (state.bossShootTimer % 40 === 0) {
        const px = state.player.x + state.player.width / 2
        const py = state.player.y + state.player.height / 2
        const mounts = [
          { x: state.boss.x - state.boss.width / 2, y: state.boss.y + state.boss.height / 8 },
          { x: state.boss.x + state.boss.width / 2, y: state.boss.y + state.boss.height / 8 },
          { x: state.boss.x, y: state.boss.y - state.boss.height / 2 },
        ]
        mounts.forEach((m) => {
          const dx = px - m.x
          const dy = py - m.y
          const len = Math.max(0.001, Math.hypot(dx, dy))
          const vx = (dx / len) * 3.2
          const vy = (dy / len) * 3.2
          state.enemyBullets.push({ x: m.x, y: m.y, vx, vy, speed: 0, owner: 'enemy', width: 4, height: 4 })
        })
      }
      // Advance any pattern specifics
      state.boss = updateBossPattern(state.boss, time, canvasRef.current)
      // switch to boss music at start of fight
      if (!state._bossMusicPlayed) {
        playBossMusic()
        state._bossMusicPlayed = true
      }
      if (state.boss.health <= 0) {
        state.isBossFight = false
        state.boss = null
        playSound('bossSpawn', 0.6)
        playGameplayMusic()
        state._bossMusicPlayed = false
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
    state.missiles.forEach((missile) => {
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
    state.enemyBullets.forEach((bullet) => {
      ctx.fillStyle = 'red'
      ctx.beginPath()
      ctx.arc(bullet.x, bullet.y, 5, 0, Math.PI * 2)
      ctx.fill()
    })
  }

  const drawPlasmaBeams = (ctx, state) => {
    state.plasmaBeams.forEach((beam) => {
      const gradient = ctx.createLinearGradient(beam.x, beam.y, beam.x, beam.y + beam.height)
      gradient.addColorStop(0, 'rgba(78, 205, 196, 0.9)')
      gradient.addColorStop(1, 'rgba(78, 205, 196, 0.1)')
      ctx.fillStyle = gradient
      ctx.fillRect(beam.x, beam.y, beam.width, beam.height)
    })
  }

  const drawAsteroids = (ctx, state) => {
    state.asteroids.forEach((asteroid) => {
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
      ctx.drawImage(
        bossImg,
        -state.boss.width / 2,
        -state.boss.height / 2,
        state.boss.width,
        state.boss.height
      )
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
      const gradient = ctx.createLinearGradient(
        -state.boss.width / 2,
        -state.boss.height / 2,
        state.boss.width / 2,
        state.boss.height / 2
      )
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
        const x = (Math.cos(angle) * state.boss.width) / 2
        const y = (Math.sin(angle) * state.boss.height) / 2
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
    const row2Y = isMobile ? 44 : 22 // only used when wrapping on mobile
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
    const livesText = `❤️ × ${lives}`
    place(livesText)

    // Best
    ctx.font = isMobile ? '11px Arial' : '12px Arial'
    ctx.fillStyle = '#ffff00'
    const bestText = `BEST: ${getPersonalBest().toString().padStart(8, '0')}`
    place(bestText)

    // Health percentage inline instead of bar (read from ref to avoid stale closure)
    const healthValue = Math.round(Math.max(0, Math.min(100, healthRef.current)))
    const healthText = `HEALTH: ${healthValue}%`
    ctx.fillStyle = '#2ecc71'
    if (healthValue <= 50) ctx.fillStyle = '#f39c12'
    if (healthValue <= 25) ctx.fillStyle = '#e74c3c'
    const hw = ctx.measureText(healthText).width
    ctx.fillText(healthText, x, y)
    x += hw + pad

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

    // Kills and Coins
    ctx.fillStyle = '#95a5a6'
    ctx.font = isMobile ? '11px Arial' : '12px Arial'
    const killsText = `Kills: ${state.currentKills || 0}`
    place(killsText)
    const coinsText = `💰 ${state.coins}`
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
      ctx.fillText('💰 Doubler', rx, midY + 14)
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
