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
import { getPersonalBest } from '../utils/scoreTracking'
import { playGameplayMusic, playBossMusic, stopMusic, ensureMusicPlaying } from '../utils/music'
import { updateStats, getSessionStats, saveSessionStats } from '../utils/gameStats'
import { saveCheckpoint, loadCheckpoint, clearCheckpoint } from '../utils/saveLoad'
import { getWeaponUpgradeMultipliers } from '../utils/weaponUpgrades'
import { getCustomization } from '../utils/customization'
import { ReplayRecorder } from '../utils/replaySystem'
import { updateChallengeProgress } from '../utils/dailyChallenges'
import { startBossRush, updateBossRush } from '../utils/bossRush'
import { spawnHazard, updateHazards, checkHazardCollision } from '../utils/environmentalHazards'
import { createComboEffect, updateComboEffects as updateComboEffectsUtil, getComboPowerUp, calculateComboMultiplier } from '../utils/comboExpansion'
import { getShipSkinColors, applyShipSkinEffects } from '../utils/shipSkins'

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
  const timeoutRefs = useRef([]) // Track setTimeout calls for cleanup
  const musicCheckIntervalRef = useRef(null) // Track music check interval
  const starsRef = useRef(null) // Pre-calculated star data for performance
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(25)
  const livesRef = useRef(25)
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
    comboMultiplier: 1.0,
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
    frameCount: 0, // Frame counter for periodic checks
    engineTrails: [], // Player engine trail particles
    scorePopups: [], // Floating score numbers
    comboEffects: [], // Combo visual effects
    waveTransition: null, // Wave transition effect
    shotsFired: 0, // Total shots fired by player
    shotsHit: 0, // Total shots that hit enemies/bosses/asteroids
    lastWaveMilestone: 0, // Track last wave milestone to prevent multiple triggers
    nextFormationId: 1, // Unique ID for each formation
    hazards: [], // Environmental hazards
    lastHazardSpawn: 0, // Last hazard spawn time
    weaponKills: {}, // Track kills per weapon for stats
    powerUpsCollected: {}, // Track power-ups collected for stats
    bossesDefeated: 0, // Track bosses defeated
  })

  // Keep a ref in sync with health so the canvas UI reads the latest value inside the gameLoop closure
  useEffect(() => {
    healthRef.current = health
  }, [health])

  // Keep lives ref in sync for canvas UI
  useEffect(() => {
    livesRef.current = lives
  }, [lives])

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

    // Set canvas size to full viewport (respecting safe areas)
    const updateCanvasSize = () => {
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      // Ensure we have valid dimensions
      if (rect.width > 0 && rect.height > 0) {
        canvas.width = rect.width
        canvas.height = rect.height
      } else {
        // Fallback to window dimensions if bounding rect is invalid
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      }
    }

    updateCanvasSize()

    // Update canvas size on window resize
    window.addEventListener('resize', updateCanvasSize)

    // Start game loop
    if (!isPaused) {
      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }
    // Start music only after a user gesture to satisfy autoplay policies
    let musicStarted = false
    const startMusicOnGesture = () => {
      if (!musicStarted) {
        playGameplayMusic()
        musicStarted = true
        // Also ensure music keeps playing - check every 2 seconds
        musicCheckIntervalRef.current = setInterval(() => {
          ensureMusicPlaying()
        }, 2000)
      }
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

      // Convert screen coords to canvas coords (prevent division by zero)
      const rectWidth = rect.width || canvas.width || 1
      const rectHeight = rect.height || canvas.height || 1
      const canvasX = (touchX / rectWidth) * canvas.width
      const canvasY = (touchY / rectHeight) * canvas.height

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

      // Prevent division by zero
      const rectWidth = rect.width || canvas.width || 1
      const rectHeight = rect.height || canvas.height || 1
      const canvasX = (touchX / rectWidth) * canvas.width
      const canvasY = (touchY / rectHeight) * canvas.height

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
      // Clear music check interval if it exists
      if (musicCheckIntervalRef.current) {
        clearInterval(musicCheckIntervalRef.current)
        musicCheckIntervalRef.current = null
      }
      // Clear all setTimeout timers to prevent memory leaks
      timeoutRefs.current.forEach((timerId) => {
        if (timerId) clearTimeout(timerId)
      })
      timeoutRefs.current = []
      // Clear invulnerability timer if it exists
      if (gameState.current?.invulnerableTimer) {
        clearTimeout(gameState.current.invulnerableTimer)
        gameState.current.invulnerableTimer = null
      }
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

  // Apply character-specific traits and ship-specific weapons
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
    
    // Ship-specific default weapons (can be overridden by power-ups)
    const shipWeapons = {
      kaden: 'laser',
      adelynn: 'spread',
      falcon: 'homing',
      phantom: 'electric',
      nova: 'plasma',
      titan: 'railgun',
      viper: 'shotgun',
      shadow: 'beam',
      meteor: 'missile',
      comet: 'freeze',
      raptor: 'laserRifle',
      aurora: 'plasmaRifle',
    }
    
    const t = traits[selectedCharacter] || traits.kaden
    state.player.speed = t.speed
    // Ship weapon takes priority over character weapon, but both can be changed by power-ups
    state.currentWeapon = shipWeapons[selectedShip] || t.weapon
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
    
    // Initialize customization (ensure it's loaded)
    if (!state.customization) {
      state.customization = getCustomization()
    }
  }, [selectedCharacter, selectedShip])

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

      // Ensure music keeps playing (check every 60 frames ~1 second)
      if (state.frameCount % 60 === 0) {
        ensureMusicPlaying()
      }
      state.frameCount = (state.frameCount || 0) + 1

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
      updateEngineTrails(state)
      updateScorePopups(state)
      updateComboEffects(state)
      updateWaveTransition(state)
      
      // Update environmental hazards
      if (canvas) {
        state.hazards = updateHazards(state.hazards || [], canvas)
      }
      
      // Spawn environmental hazards
      if (canvas && state.wave >= 3) {
        const now = Date.now()
        if (now - (state.lastHazardSpawn || 0) > 10000) { // Every 10 seconds
          const hazard = spawnHazard(state.wave, canvas)
          if (hazard) {
            if (!state.hazards) state.hazards = []
            state.hazards.push(hazard)
            state.lastHazardSpawn = now
          }
        }
      }

      // Check collisions
      checkCollisions(state)
      
      // Check hazard collisions with player
      if (state.hazards && state.hazards.length > 0) {
        const collidingHazard = checkHazardCollision(state.player, state.hazards)
        if (collidingHazard && !state.invulnerable && !state.shield) {
          const damage = collidingHazard.damage || 10
          setHealth((h) => Math.max(0, h - damage))
          healthRef.current = Math.max(0, healthRef.current - damage)
          if (healthRef.current <= 0 && lives > 0) {
            setLives((l) => l - 1)
            livesRef.current = livesRef.current - 1
            setHealth(100)
            healthRef.current = 100
            state.invulnerable = true
            if (state.invulnerableTimer) clearTimeout(state.invulnerableTimer)
            state.invulnerableTimer = setTimeout(() => {
              state.invulnerable = false
            }, 2000)
          }
          // Remove hazard after collision
          const hazardIndex = state.hazards.indexOf(collidingHazard)
          if (hazardIndex > -1) {
            state.hazards.splice(hazardIndex, 1)
          }
          playSound('hit', 0.5)
        }
      }

      // Spawn enemies
      spawnEnemies(state)

      // Spawn power-ups
      spawnPowerUps(state)
      
      // Spawn combo-based power-ups
      if (state.streakCombo >= 10) {
        const comboPowerUp = getComboPowerUp(state.streakCombo)
        if (comboPowerUp && Math.random() < 0.3 && canvas) {
          const x = Math.random() * (canvas.width - 100) + 50
          const y = Math.random() * (canvas.height - 200) + 100
          const powerUp = createPowerUp(x, y)
          powerUp.type = comboPowerUp
          if (!state.powerUps) state.powerUps = []
          state.powerUps.push(powerUp)
        }
      }

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
      drawEngineTrails(ctx, state)
      drawPlayer(ctx, state)
      drawBoss(ctx, state)
      drawScorePopups(ctx, state)
      drawComboEffects(ctx, state)
      drawHazards(ctx, state)
      drawWaveTransition(ctx, state)
      drawUI(ctx, state)

      if (state.shakeIntensity > 0) {
        ctx.restore()
      }

      // Periodic memory cleanup (every 3 seconds at 60fps = 180 frames) - more frequent for better performance
      if (state.frameCount % 180 === 0 && state.frameCount > 0) {
        // Force cleanup of any lingering objects with stricter limits
        if (state.particles && state.particles.length > 80) {
          state.particles.length = 80
        }
        if (state.bullets && state.bullets.length > 200) {
          state.bullets.length = 200
        }
        if (state.enemyBullets && state.enemyBullets.length > 150) {
          state.enemyBullets.length = 150
        }
        if (state.scorePopups && state.scorePopups.length > 10) {
          state.scorePopups.length = 10
        }
        if (state.comboEffects && state.comboEffects.length > 8) {
          state.comboEffects.length = 8
        }
        if (state.engineTrails && state.engineTrails.length > 15) {
          state.engineTrails.length = 15
        }
        // Cleanup null entries less frequently (expensive operation)
        if (state.frameCount % 360 === 0) {
          state.enemies = state.enemies.filter(e => e != null)
          state.bullets = state.bullets.filter(b => b != null)
          state.missiles = state.missiles.filter(m => m != null)
          state.powerUps = state.powerUps.filter(p => p != null)
          state.asteroids = state.asteroids.filter(a => a != null)
        }
      }

      // Check level progression
      checkLevelProgression(state)
      processGameMode(state)

      // Update daily challenge progress
      if (state.frameCount % 60 === 0) { // Every second at 60fps
        updateChallengeProgress({
          score: state.currentScore,
          wave: state.wave,
          kills: state.currentKills,
          combo: state.streakCombo,
          maxCombo: state.streakCombo,
          weapon: state.currentWeapon,
          shotsFired: state.shotsFired,
          shotsHit: state.shotsHit,
          bossesDefeated: state.bossesDefeated || 0,
          weaponKills: state.weaponKills || {},
          damageTaken: 100 - (healthRef.current || 100),
        })
      }
      
      // Update boss rush if active
      if (state.gameMode === 'bossRush' && state.bossRushState) {
        state.bossRushState = updateBossRush(state.bossRushState, state)
      }
      
      // Auto-save checkpoint every 30 seconds
      if (state.frameCount % 1800 === 0) { // Every 30 seconds at 60fps
        saveCheckpoint({
          currentScore: state.currentScore,
          wave: state.wave,
          level: state.level,
          kills: state.currentKills,
          combo: state.streakCombo,
          player: { health: healthRef.current, lives: livesRef.current },
          currentWeapon: state.currentWeapon,
        })
      }
      
      // Record replay frame
      if (state.replayRecorder && state.replayRecorder.isRecording) {
        state.replayRecorder.recordFrame(state)
      }
      
      // Check game over
      if (lives <= 0) {
        // Stop replay recording
        if (state.replayRecorder && state.replayRecorder.isRecording) {
          const replay = state.replayRecorder.stop()
          if (replay) {
            state.replayRecorder.saveReplay(replay)
          }
        }
        
        // Calculate play time
        const playTime = state.sessionStartTime 
          ? Math.floor((Date.now() - state.sessionStartTime) / 1000)
          : 0
        
        // Update statistics
        updateStats({
          score: state.currentScore,
          wave: state.wave,
          level: state.level,
          kills: state.currentKills,
          combo: state.streakCombo,
          playTime,
          weapon: state.currentWeapon,
          shotsFired: state.shotsFired,
          shotsHit: state.shotsHit,
          bossesDefeated: state.bossesDefeated || 0,
          powerUpsCollected: state.powerUpsCollected || {},
          difficulty,
          weaponKills: state.weaponKills || {},
          maxCombo: state.streakCombo,
          damageTaken: 100 - (healthRef.current || 100),
        })
        
        // Clear checkpoint
        clearCheckpoint()
        
        onGameOver(score, wave, level, killStreak, combo)
        return
      }

      // Throttle setTimePlayed to once per second (60 frames) for performance
      if (state.frameCount % 60 === 0) {
        setTimePlayed((t) => t + 1)
      }

      if (!isPaused) {
        gameLoopRef.current = requestAnimationFrame(gameLoop)
      }
    },
    [isPaused, lives, onGameOver, score, wave, level, killStreak, combo, playerName]
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

    // Track bullets before adding new ones
    const bulletsBefore = state.bullets.length
    const missilesBefore = state.missiles.length
    const plasmaBeamsBefore = state.plasmaBeams.length
    
    // Get weapon upgrade multipliers
    const upgrades = state.weaponUpgrades || getWeaponUpgradeMultipliers(state.currentWeapon)
    const damageMultiplier = upgrades.damage || 1.0
    const rangeMultiplier = upgrades.range || 1.0

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
        // Find nearest enemy for homing
        let nearestEnemy = null
        let nearestDist = Infinity
        for (const enemy of state.enemies) {
          const dx = enemy.x - state.player.x
          const dy = enemy.y - state.player.y
          const dist = Math.hypot(dx, dy)
          if (dist < nearestDist) {
            nearestDist = dist
            nearestEnemy = enemy
          }
        }
        if (nearestEnemy) {
          state.missiles.push({
            x: state.player.x,
            y: state.player.y,
            speed: 8,
            target: nearestEnemy,
            explosion: false,
            homing: true,
          })
        }
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

    // Count shots fired (bullets, missiles, and plasma beams added)
    const bulletsAdded = state.bullets.length - bulletsBefore
    const missilesAdded = state.missiles.length - missilesBefore
    const plasmaBeamsAdded = state.plasmaBeams.length - plasmaBeamsBefore
    state.shotsFired += bulletsAdded + missilesAdded + plasmaBeamsAdded

    // Add muzzle flash particle (stricter limit for performance)
    if (state.particles.length < 60) {
      state.particles.push(
        ...ParticleSystem.createExplosion(
          state.player.x + state.player.width / 2,
          state.player.y,
          '#ffd700',
          3 // Reduced from 5
        )
      )
    }
  }

  const updateBullets = (state) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const timeScale = Math.min(state.deltaTime / 16.67, 2)
    // Limit bullets to prevent performance issues - filter first, then limit
    const MAX_BULLETS = 300
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
    // Enforce hard limit after filtering
    if (state.bullets.length > MAX_BULLETS) {
      state.bullets = state.bullets.slice(0, MAX_BULLETS)
    }
  }

  const updateEnemies = (state) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const timeScale = Math.min(state.deltaTime / 16.67, 2)
    // Limit enemies to prevent performance issues
    const MAX_ENEMIES = 50
    
    // Group enemies by formation for coordinated movement
    const formationGroups = {}
    state.enemies.forEach((enemy) => {
      if (enemy.formationId) {
        if (!formationGroups[enemy.formationId]) {
          formationGroups[enemy.formationId] = []
        }
        formationGroups[enemy.formationId].push(enemy)
      }
    })
    
    state.enemies = state.enemies.slice(0, MAX_ENEMIES).filter((enemy) => {
      // Handle formation movement
      if (enemy.formationId && !enemy.isFormationLeader) {
        // Find the formation leader
        const formation = formationGroups[enemy.formationId]
        if (formation) {
          const leader = formation.find((e) => e.isFormationLeader)
          if (leader) {
            // Maintain relative position to leader
            const targetX = leader.x + enemy.formationOffsetX
            const targetY = leader.y + enemy.formationOffsetY
            
            // Smooth movement toward formation position
            const dx = targetX - enemy.x
            const dy = targetY - enemy.y
            const distance = Math.hypot(dx, dy)
            
            if (distance > 5) {
              // Move toward formation position
              enemy.x += (dx / distance) * enemy.speed * timeScale * 0.5
              enemy.y += (dy / distance) * enemy.speed * timeScale * 0.5
            } else {
              // Close enough, just follow leader's movement
              enemy.y += enemy.speed * timeScale
            }
          } else {
            // Leader destroyed, continue normal movement
            enemy.y += enemy.speed * timeScale
          }
        } else {
          // Formation broken, continue normal movement
          enemy.y += enemy.speed * timeScale
        }
      } else {
        // Normal enemy movement (single enemy or formation leader)
        enemy.y += enemy.speed * timeScale
        
        // Formation leaders can have special movement
        if (enemy.isFormationLeader && enemy.formationType === 'v') {
          // V-formation leaders can zigzag slightly
          enemy.x += Math.sin(enemy.y / 40) * 1.5 * timeScale
        }
      }

      // Simple movement patterns (for non-formation enemies or additional movement)
      if (!enemy.formationId || enemy.isFormationLeader) {
        if (enemy.pattern === 'zigzag') {
          enemy.x += Math.sin(enemy.y / 20) * 2 * timeScale
        } else if (enemy.pattern === 'sway') {
          enemy.x += Math.sin(enemy.y / 30) * 3 * timeScale
        } else if (enemy.pattern === 'dash') {
          if (Math.random() < 0.02) enemy.y += 20 * timeScale
        }
      }

      // Make enemies shoot more frequently based on difficulty!
      // Easy: 0.01 (1%), Medium: 0.015 (1.5%), Hard: 0.02 (2%)
      const shootChance = 0.01 * difficultyModifier()
      if (Math.random() < shootChance && enemy.y > 50 && enemy.y < canvas.height - 100) {
        // Limit enemy bullet creation
        if (state.enemyBullets.length < 180) {
          state.enemyBullets.push({
            x: enemy.x + 15,
            y: enemy.y + 30,
            speed: 3 * timeScale,
            owner: 'enemy',
            width: 3,
            height: 8,
          })
        }
      }

      return enemy.y < canvas.height + 50
    })
    // Enforce hard limit after filtering
    if (state.enemies.length > MAX_ENEMIES) {
      state.enemies = state.enemies.slice(0, MAX_ENEMIES)
    }
  }

  // Spawn a formation of enemies
  const spawnFormation = (state, formationType, centerX, startY) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const formationId = state.nextFormationId++
    const baseSilverChance = state.wave >= 4 ? 0.4 : 0.25
    const baseSpeed = difficultyModifier() * (state.wave < 3 ? 1.0 : 1.3) * (state.dailyChallenge === 0 ? 1.2 : 1.0)
    const formationEnemies = []
    
    let positions = []
    let count = 3 // Default formation size
    
    switch (formationType) {
      case 'v': // V-formation (3-5 enemies)
        count = state.wave >= 3 ? 5 : 3
        for (let i = 0; i < count; i++) {
          const offset = (i - Math.floor(count / 2)) * 50
          const depth = Math.abs(offset) * 0.3
          positions.push({ x: centerX + offset, y: startY - depth })
        }
        break
      case 'line': // Horizontal line (3-5 enemies)
        count = state.wave >= 3 ? 5 : 3
        for (let i = 0; i < count; i++) {
          const offset = (i - Math.floor(count / 2)) * 60
          positions.push({ x: centerX + offset, y: startY })
        }
        break
      case 'diamond': // Diamond formation (5 enemies)
        count = 5
        positions = [
          { x: centerX, y: startY - 40 }, // Top
          { x: centerX - 40, y: startY }, // Left
          { x: centerX, y: startY }, // Center
          { x: centerX + 40, y: startY }, // Right
          { x: centerX, y: startY + 40 }, // Bottom
        ]
        break
      case 'circle': // Circle formation (5-7 enemies)
        count = state.wave >= 4 ? 7 : 5
        const radius = 60
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2
          positions.push({
            x: centerX + Math.cos(angle) * radius,
            y: startY + Math.sin(angle) * radius,
          })
        }
        break
      case 'arrow': // Arrow formation (4-6 enemies)
        count = state.wave >= 3 ? 6 : 4
        for (let i = 0; i < count; i++) {
          if (i === 0) {
            positions.push({ x: centerX, y: startY - 30 }) // Leader
          } else {
            const side = i % 2 === 0 ? 1 : -1
            const row = Math.floor((i - 1) / 2) + 1
            positions.push({
              x: centerX + side * 40,
              y: startY + row * 30,
            })
          }
        }
        break
      default:
        return // Unknown formation type
    }
    
    // Create enemies for the formation
    positions.forEach((pos, index) => {
      const isSilver = index === 0 || Math.random() < baseSilverChance // Leader or random
      const pattern = index === 0 ? 'normal' : ['normal', 'zigzag', 'sway'][Math.floor(Math.random() * 3)]
      
      const enemy = {
        x: Math.max(30, Math.min(canvas.width - 30, pos.x)),
        y: pos.y,
        speed: baseSpeed * (isSilver ? 0.95 : 1.0),
        pattern,
        health: isSilver ? 4 : state.wave < 3 ? 1 : 2,
        type: isSilver ? 'silver' : 'red',
        formationId,
        formationType,
        formationIndex: index,
        isFormationLeader: index === 0,
        formationOffsetX: pos.x - centerX,
        formationOffsetY: pos.y - startY,
      }
      formationEnemies.push(enemy)
    })
    
    state.enemies.push(...formationEnemies)
    state.enemiesSpawned += formationEnemies.length
  }

  const spawnEnemies = (state) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const now = Date.now()
    const baseRate = state.wave <= 2 ? 2600 : state.wave <= 4 ? 2200 : 1800
    let spawnRate = baseRate / difficultyModifier()
    if (state.dailyChallenge === 0) spawnRate *= 0.8
    
    // Formation spawn chance increases with wave
    const formationChance = state.wave >= 3 ? 0.35 : state.wave >= 2 ? 0.2 : 0.1
    
    if (now - state.lastEnemySpawn > spawnRate) {
      // Decide whether to spawn a formation or single enemy
      if (Math.random() < formationChance && state.wave >= 2) {
        // Spawn a formation
        const formationTypes = ['v', 'line', 'diamond', 'circle', 'arrow']
        const formationType = formationTypes[Math.floor(Math.random() * formationTypes.length)]
        const centerX = Math.random() * (canvas.width - 200) + 100
        const startY = -50
        
        spawnFormation(state, formationType, centerX, startY)
      } else {
        // Spawn a single enemy (original logic)
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
        state.enemiesSpawned++
      }
      
      state.lastEnemySpawn = now
    }
  }

  const difficultyModifier = () => {
    return difficulty === 'easy' ? 1 : difficulty === 'medium' ? 1.5 : 2
  }

  const checkCollisions = (state) => {
    // Bullet-enemy collisions - use safer iteration with early exits
    const bulletsToRemove = []
    const enemiesToRemove = []
    const asteroidsToRemove = []

    // Early exit if no bullets or enemies
    if (state.bullets.length === 0 || state.enemies.length === 0) {
      // Still check other collisions (boss, asteroids, etc.)
    } else {
      for (let i = 0; i < state.bullets.length; i++) {
        const bullet = state.bullets[i]
        if (!bullet || bullet.owner !== 'player') continue

        // Quick bounds check - skip if bullet is way off screen
        if (bullet.y < -50 || bullet.y > (canvasRef.current?.height || 1000) + 50) continue

        for (let j = 0; j < state.enemies.length; j++) {
          const enemy = state.enemies[j]
          if (!enemy) continue

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
          // Track hit
          state.shotsHit++
          // Update score - sync with gameState (apply combo multiplier)
          const comboMult = state.comboMultiplier || 1.0
          const points = Math.floor(10 * state.scoreMultiplier * comboMult)
          // Add score popup
          if (state.scorePopups.length < 10) {
            state.scorePopups.push({
              x: enemy.x + 15,
              y: enemy.y + 15,
              value: points,
              life: 60,
              vy: -2,
              scale: 1,
            })
          }
          setScore((s) => {
            const newScore = s + points
            state.currentScore = newScore // Sync to gameState

            // Check achievements - use state.currentKills to avoid stale closure
            if ((state.currentKills || 0) === 0) {
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
          
          // Add combo effect for high combos
          if (newCombo >= 5 && newCombo % 5 === 0) {
            state.comboEffects.push({
              x: state.player.x + state.player.width / 2,
              y: state.player.y - 30,
              text: `COMBO x${newCombo}!`,
              life: 90,
              scale: 1.5,
              alpha: 1,
            })
          }

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
            // Limit particle creation to prevent overflow (reduced for performance)
            if (state.particles.length < 60) {
              state.particles.push(
                ...ParticleSystem.createExplosion(enemy.x + 15, enemy.y + 15, '#ff6666', 6)
              )
            }
          }
          break
        }
      }
    }

    // Bullet-boss collisions (swept) - only check if boss exists
    if (state.boss && state.bullets.length > 0) {
      for (let i = 0; i < state.bullets.length; i++) {
        const bullet = state.bullets[i]
        if (!bullet || bullet.owner !== 'player') continue
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
        if (bossHit && state.boss) {
          // Track hit
          state.shotsHit++
          // Boss takes damage (ensure health doesn't go negative)
          state.boss.health = Math.max(0, state.boss.health - Math.max(10, 20 * (state.damageMul || 1)))

          // Remove bullet unless it's piercing
          if (!bullet.pierce) {
            bulletsToRemove.push(i)
          }

          // Add hit effect
          playSound('hit', 0.3)
          // Limit particle creation to prevent overflow (reduced for performance)
          if (state.particles.length < 60) {
            state.particles.push(...ParticleSystem.createExplosion(bullet.x, bullet.y, '#ff0080', 5))
          }

          // Boss defeated?
          if (state.boss.health <= 0) {
            playSound('bossSpawn', 0.6)
            // Give bonus score
            const comboMult = state.comboMultiplier || 1.0
            const bossPoints = Math.floor(500 * state.scoreMultiplier * comboMult)
            setScore((s) => {
              const newScore = s + bossPoints
              state.currentScore = newScore

              // Check for perfect boss achievement (no damage) - use healthRef to avoid stale closure
              if (healthRef.current >= 100) {
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

    // Bullet-asteroid collisions (swept circle-rect)
    if (state.asteroids && state.asteroids.length > 0 && state.bullets.length > 0) {
      for (let i = 0; i < state.bullets.length; i++) {
        const bullet = state.bullets[i]
        if (!bullet || bullet.owner !== 'player') continue
        
        for (let a = 0; a < state.asteroids.length; a++) {
          const asteroid = state.asteroids[a]
          if (!asteroid) continue
          
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
            // Track hit
            state.shotsHit++
            // damage asteroid
            asteroid.health =
              (typeof asteroid.health === 'number' ? asteroid.health : 2) - (state.damageMul || 1)
            // remove bullet unless piercing
            if (!bullet.pierce) bulletsToRemove.push(i)
            playSound('hit', 0.3)
            // Limit particle creation to prevent overflow (reduced for performance)
            if (state.particles.length < 60) {
              state.particles.push(
                ...ParticleSystem.createExplosion(bullet.x, bullet.y, '#ffa502', 4)
              )
            }
            if (asteroid.health <= 0) {
              // split into smaller pieces
              splitAsteroid(state, asteroid)
              asteroidsToRemove.push(a)
              // Limit particle creation to prevent overflow (reduced for performance)
              if (state.particles.length < 50) {
                state.particles.push(
                  ...ParticleSystem.createExplosion(asteroid.x, asteroid.y, '#ffa502', 8)
                )
              }
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
      const missileEnemiesToRemove = []
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
            // Track hit
            state.shotsHit++
            // Update score - sync with gameState
            const points = Math.floor(10 * state.scoreMultiplier)
            setScore((s) => {
              const newScore = s + points
              state.currentScore = newScore
              return newScore
            })
            // Update combo and kills
            const newCombo = combo + 1
            setCombo(newCombo)
            setKillStreak((k) => k + 1)
            setEnemiesKilled((e) => e + 1)
            state.currentKills = (state.currentKills || 0) + 1
            // Explosion feedback
            playSound('hit', 0.5)
            // Limit particle creation to prevent overflow (reduced for performance)
            if (state.particles.length < 60) {
              state.particles.push(
                ...ParticleSystem.createExplosion(enemy.x + 15, enemy.y + 15, '#ff8c00', 6)
              )
            }
            missileEnemiesToRemove.push(j)
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
      missileEnemiesToRemove
        .sort((a, b) => b - a)
        .forEach((index) => {
          state.enemies.splice(index, 1)
        })
    }

    // Plasma beams-enemy collisions (for plasma weapons)
    if (state.plasmaBeams && state.plasmaBeams.length > 0 && state.enemies.length > 0) {
      const beamEnemiesToRemove = []
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
            // Track hit
            state.shotsHit++
            // Update score - sync with gameState
            const points = Math.floor(10 * state.scoreMultiplier)
            setScore((s) => {
              const newScore = s + points
              state.currentScore = newScore
              return newScore
            })
            // Update combo and kills
            const newCombo = combo + 1
            setCombo(newCombo)
            state.streakCombo = newCombo
            setKillStreak((k) => k + 1)
            setEnemiesKilled((e) => e + 1)
            state.currentKills = (state.currentKills || 0) + 1
            
            // Track weapon kills
            if (!state.weaponKills) state.weaponKills = {}
            if (!state.weaponKills[state.currentWeapon]) {
              state.weaponKills[state.currentWeapon] = 0
            }
            state.weaponKills[state.currentWeapon]++
            
            // Add combo effects
            if (newCombo >= 5 && newCombo % 5 === 0) {
              const effects = createComboEffect(
                newCombo,
                enemy.x + 15,
                enemy.y + 15
              )
              state.comboEffects.push(...effects)
            }
            state.comboMultiplier = calculateComboMultiplier(newCombo)
            
            playSound('hit', 0.4)
            // Limit particle creation to prevent overflow (reduced for performance)
            if (state.particles.length < 60) {
              state.particles.push(
                ...ParticleSystem.createExplosion(enemy.x + 15, enemy.y + 15, '#00ffff', 5)
              )
            }
            beamEnemiesToRemove.push(j)
            // beams can persist; optionally remove after a hit
            break // Only hit one enemy per beam per frame
          }
        }
      }
      // Remove enemies hit by beams
      beamEnemiesToRemove
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
              // Clear any existing invulnerability timer
              if (state.invulnerableTimer) {
                clearTimeout(state.invulnerableTimer)
              }
              state.invulnerableTimer = setTimeout(() => { 
                state.invulnerable = false
                state.invulnerableTimer = null
              }, 2000)
              timeoutRefs.current.push(state.invulnerableTimer)
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

      // Asteroid-player collisions (circle-rectangle collision)
      if (state.asteroids && state.asteroids.length > 0) {
        const asteroidsToRemove = []
        for (let i = 0; i < state.asteroids.length; i++) {
          const asteroid = state.asteroids[i]
          const asteroidRadius = Math.max(10, asteroid.size)
          const asteroidX = asteroid.x
          const asteroidY = asteroid.y
          
          // Player ship bounding box
          const playerLeft = state.player.x
          const playerRight = state.player.x + state.player.width
          const playerTop = state.player.y
          const playerBottom = state.player.y + state.player.height
          
          // Find closest point on player rectangle to asteroid center
          const closestX = Math.max(playerLeft, Math.min(asteroidX, playerRight))
          const closestY = Math.max(playerTop, Math.min(asteroidY, playerBottom))
          
          // Calculate distance from asteroid center to closest point
          const dx = asteroidX - closestX
          const dy = asteroidY - closestY
          const distanceSquared = dx * dx + dy * dy
          
          // Check if asteroid overlaps with player (circle-rectangle collision)
          if (distanceSquared <= asteroidRadius * asteroidRadius) {
            // Player takes hull damage
            setHealth((h) => {
              const newHealth = h - 5 // Asteroids do more damage than enemies
              if (newHealth <= 0) {
                setLives((l) => Math.max(0, l - 1))
                state.invulnerable = true
                // Clear any existing invulnerability timer
                if (state.invulnerableTimer) {
                  clearTimeout(state.invulnerableTimer)
                }
                state.invulnerableTimer = setTimeout(() => { 
                  state.invulnerable = false
                  state.invulnerableTimer = null
                }, 2000)
                timeoutRefs.current.push(state.invulnerableTimer)
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
            
            // Visual feedback
            state.shakeIntensity = 8 // Stronger shake for asteroid impact
            playSound('hit', 0.6)
            // Limit particle creation to prevent overflow (reduced for performance)
            if (state.particles.length < 50) {
              state.particles.push(
                ...ParticleSystem.createExplosion(asteroidX, asteroidY, '#ff8c00', 6)
              )
            }
            
            // Damage the asteroid (but don't remove it - let it continue)
            asteroid.health = (typeof asteroid.health === 'number' ? asteroid.health : 2) - 1
            
            // Only remove asteroid if it's destroyed
            if (asteroid.health <= 0) {
              splitAsteroid(state, asteroid)
              asteroidsToRemove.push(i)
              // Limit particle creation to prevent overflow (reduced for performance)
              if (state.particles.length < 50) {
                state.particles.push(
                  ...ParticleSystem.createExplosion(asteroidX, asteroidY, '#ffa502', 8)
                )
              }
              // Award coins and score for destroying asteroid
              state.coins += 5
              setCoins((c) => c + 5)
              const asteroidPoints = 10
              setScore((s) => {
                const ns = s + asteroidPoints
                state.currentScore = ns
                return ns
              })
            }
            break // Only process one collision per frame
          }
        }
        
        // Remove destroyed asteroids safely
        asteroidsToRemove
          .sort((a, b) => b - a)
          .forEach((index) => {
            state.asteroids.splice(index, 1)
          })
      }

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
            if (newHealth <= 0) {
              setLives((l) => Math.max(0, l - 1))
              state.invulnerable = true
              // Clear any existing invulnerability timer
              if (state.invulnerableTimer) {
                clearTimeout(state.invulnerableTimer)
              }
              state.invulnerableTimer = setTimeout(() => { 
                state.invulnerable = false
                state.invulnerableTimer = null
              }, 2000)
              timeoutRefs.current.push(state.invulnerableTimer)
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
            // Limit particle creation to prevent overflow (reduced for performance)
            if (state.particles.length < 50) {
              state.particles.push(...ParticleSystem.createExplosion(ast.x, ast.y, '#ff8c00', 8))
            }
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
            // Limit particle creation to prevent overflow (reduced for performance)
            if (state.particles.length < 50) {
              state.particles.push(...ParticleSystem.createExplosion(cx, cy, '#00ffff', 5))
            }
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

    // Get base colors from character/ship
    let baseShipColor = '#4ecdc4'
    let baseAccentColor = '#00ffff'
    if (selectedCharacter === 'adelynn') {
      baseShipColor = '#ff6b9a'
      baseAccentColor = '#ff00ff'
    } else if (selectedShip !== 'kaden') {
      baseShipColor = '#ff6b6b'
      baseAccentColor = '#ff00ff'
    }
    
    // Get selected skin from customization
    const selectedSkin = state.customization?.selectedShipSkin || 'default'
    const skinColors = getShipSkinColors(selectedSkin, baseShipColor, baseAccentColor)
    
    const shipColor = skinColors.shipColor
    const accentColor = skinColors.accentColor
    const engineColor = skinColors.engineColor

    if (state.invulnerable) {
      ctx.globalAlpha = 0.5
    }

    // Apply skin-specific effects
    const skinGradient = applyShipSkinEffects(
      ctx,
      selectedSkin,
      state.player.x,
      state.player.y,
      state.player.width,
      state.player.height
    )
    
    // Glow effect with skin intensity
    ctx.shadowBlur = skinColors.glowIntensity
    ctx.shadowColor = skinColors.glowColor
    
    // Pulse effect for certain skins
    let pulseScale = 1
    if (skinColors.hasPulse) {
      const time = Date.now() / 1000
      pulseScale = 1 + Math.sin(time * skinColors.pulseSpeed) * 0.05
    }

    // Main body with skin gradient if applicable
    if (skinGradient) {
      ctx.fillStyle = skinGradient
    } else {
      ctx.fillStyle = shipColor
    }
    ctx.beginPath()
    ctx.moveTo(state.player.x + state.player.width / 2, state.player.y)
    ctx.lineTo(state.player.x + state.player.width, state.player.y + state.player.height - 10)
    ctx.lineTo(state.player.x + state.player.width * 0.8, state.player.y + state.player.height)
    ctx.lineTo(state.player.x + state.player.width * 0.2, state.player.y + state.player.height)
    ctx.lineTo(state.player.x, state.player.y + state.player.height - 10)
    ctx.closePath()
    ctx.fill()
    
    // If gradient was used (chrome/gold), overlay base color with transparency for depth
    if (skinGradient && (selectedSkin === 'chrome' || selectedSkin === 'gold')) {
      ctx.fillStyle = shipColor
      ctx.globalAlpha = 0.5
      ctx.fill()
      ctx.globalAlpha = state.invulnerable ? 0.5 : 1
    }

    // Accent details
    ctx.fillStyle = accentColor
    ctx.fillRect(
      state.player.x + state.player.width * 0.35,
      state.player.y + state.player.height * 0.5,
      state.player.width * 0.3,
      state.player.height * 0.3
    )
    
    // Special skin details
    if (selectedSkin === 'ice') {
      // Ice crystal details
      ctx.strokeStyle = 'rgba(176, 224, 230, 0.8)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(state.player.x + state.player.width * 0.2, state.player.y + state.player.height * 0.3)
      ctx.lineTo(state.player.x + state.player.width * 0.5, state.player.y + state.player.height * 0.2)
      ctx.lineTo(state.player.x + state.player.width * 0.8, state.player.y + state.player.height * 0.3)
      ctx.stroke()
    } else if (selectedSkin === 'fire') {
      // Fire details
      const fireTime = Date.now() / 200
      ctx.fillStyle = `hsl(${15 + Math.sin(fireTime) * 10}, 100%, 60%)`
      ctx.fillRect(
        state.player.x + state.player.width * 0.4,
        state.player.y + state.player.height * 0.2,
        state.player.width * 0.2,
        state.player.height * 0.15
      )
    } else if (selectedSkin === 'rainbow') {
      // Rainbow accent stripes
      const rainbowTime = Date.now() / 1000
      for (let i = 0; i < 3; i++) {
        const hue = ((rainbowTime * 50) + i * 60) % 360
        ctx.fillStyle = `hsl(${hue}, 100%, 60%)`
        ctx.fillRect(
          state.player.x + state.player.width * 0.3 + i * 5,
          state.player.y + state.player.height * 0.4,
          state.player.width * 0.1,
          state.player.height * 0.2
        )
      }
    }

    // Enhanced engine glow with animation (skin-aware)
    const time = Date.now() / 1000
    const enginePulse = Math.sin(time * 8) * 0.3 + 0.7
    const engineGlow = ctx.createLinearGradient(
      state.player.x + state.player.width * 0.35,
      state.player.y + state.player.height,
      state.player.x + state.player.width * 0.65,
      state.player.y + state.player.height + 15
    )
    
    // Engine color based on skin
    let engineBaseColor = engineColor || shipColor
    if (selectedSkin === 'fire') {
      engineGlow.addColorStop(0, `hsl(${15 + Math.sin(time * 4) * 10}, 100%, 50%)`)
      engineGlow.addColorStop(0.3, engineBaseColor)
      engineGlow.addColorStop(0.7, engineBaseColor)
      engineGlow.addColorStop(1, `hsl(${25}, 100%, 30%)`)
    } else if (selectedSkin === 'ice') {
      engineGlow.addColorStop(0, `rgba(176, 224, 230, ${enginePulse})`)
      engineGlow.addColorStop(0.3, engineBaseColor)
      engineGlow.addColorStop(0.7, engineBaseColor)
      engineGlow.addColorStop(1, `rgba(135, 206, 235, ${enginePulse * 0.5})`)
    } else if (selectedSkin === 'rainbow') {
      const hue = (time * 50) % 360
      engineGlow.addColorStop(0, `hsl(${hue}, 100%, 60%)`)
      engineGlow.addColorStop(0.3, `hsl(${(hue + 60) % 360}, 100%, 50%)`)
      engineGlow.addColorStop(0.7, `hsl(${(hue + 120) % 360}, 100%, 50%)`)
      engineGlow.addColorStop(1, `hsl(${(hue + 180) % 360}, 100%, 40%)`)
    } else {
      engineGlow.addColorStop(0, `rgba(255, 255, 0, ${enginePulse})`)
      engineGlow.addColorStop(0.3, engineBaseColor)
      engineGlow.addColorStop(0.7, engineBaseColor)
      engineGlow.addColorStop(1, `rgba(255, 255, 0, ${enginePulse * 0.5})`)
    }
    
    ctx.fillStyle = engineGlow
    ctx.fillRect(
      state.player.x + state.player.width * 0.25,
      state.player.y + state.player.height * 0.9,
      state.player.width * 0.5,
      state.player.height * 0.15 + 10 * enginePulse
    )
    
    // Add engine trail particles (skin-aware colors)
    if (state.engineTrails.length < 8) {
      let trailColor = engineColor || shipColor
      if (selectedSkin === 'rainbow') {
        const hue = (time * 50) % 360
        trailColor = `hsl(${hue}, 100%, 60%)`
      } else if (selectedSkin === 'fire') {
        trailColor = `hsl(${15 + Math.random() * 20}, 100%, 50%)`
      } else if (selectedSkin === 'ice') {
        trailColor = Math.random() > 0.5 ? '#87ceeb' : '#b0e0e6'
      }
      
      state.engineTrails.push({
        x: state.player.x + state.player.width / 2 + (Math.random() - 0.5) * state.player.width * 0.3,
        y: state.player.y + state.player.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: 2 + Math.random() * 1,
        life: 20,
        size: 2 + Math.random() * 2,
        color: trailColor,
      })
    }

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
    // Optimized: Use for loop, batch similar colors, reduce state changes
    const bullets = state.bullets
    const len = bullets.length
    let lastColor = null
    
    for (let i = 0; i < len; i++) {
      const bullet = bullets[i]
      if (!bullet) continue
      
      const color = bullet.color || (bullet.owner === 'player' ? 'cyan' : 'red')
      const bw = bullet.width || 5
      const bh = bullet.height || 10

      // Special freeze effect (less frequent, keep it)
      if (bullet.freeze) {
        ctx.strokeStyle = '#00bfff'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(bullet.x, bullet.y, bw, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Only change fillStyle when color changes
      if (color !== lastColor) {
        ctx.fillStyle = color
        lastColor = color
      }
      ctx.fillRect(bullet.x, bullet.y, bw, bh)

      // Skip glow effects for performance (only show on every 3rd special bullet)
      if ((bullet.pierce || bullet.explosive) && i % 3 === 0) {
        ctx.globalAlpha = 0.5
        ctx.shadowBlur = 8
        ctx.shadowColor = color
        ctx.fillRect(bullet.x, bullet.y, bw, bh)
        ctx.globalAlpha = 1
        ctx.shadowBlur = 0
      }
    }
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
    // Optimized: Use for loop instead of forEach, batch by color
    const particles = state.particles
    const len = particles.length
    let lastColor = null
    
    for (let i = 0; i < len; i++) {
      const p = particles[i]
      if (!p) continue
      
      // Only change fillStyle when color changes (reduces state changes)
      if (p.color !== lastColor) {
        ctx.fillStyle = p.color
        lastColor = p.color
      }
      ctx.fillRect(p.x, p.y, 2, 2)
    }
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
    const MAX_POWERUPS = 10
    
    state.powerUps = state.powerUps.filter((powerUp) => {
      if (!powerUp) return false
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
        state.coins += 10
        setCoins((c) => c + 10)
        return false // Remove this power-up
      }

      return powerUp.y < canvas.height + 50
    })
    
    // Enforce hard limit after filtering
    if (state.powerUps.length > MAX_POWERUPS) {
      state.powerUps = state.powerUps.slice(0, MAX_POWERUPS)
    }
  }

  const updateParticles = (state) => {
    // Optimized: Stricter particle limit and combined filter+update for better performance
    const MAX_PARTICLES = 100 // Reduced from 150
    const particles = state.particles
    let writeIndex = 0
    const len = Math.min(particles.length, MAX_PARTICLES)
    
    for (let i = 0; i < len; i++) {
      const p = particles[i]
      if (p && p.life > 1) {
        p.life--
        // Update position if particle has velocity
        if (p.vx !== undefined) p.x += p.vx
        if (p.vy !== undefined) p.y += p.vy
        particles[writeIndex++] = p
      }
    }
    
    // Trim array efficiently
    state.particles.length = writeIndex
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
    // Limit missiles to prevent performance issues
    const MAX_MISSILES = 50
    state.missiles = state.missiles.filter((missile) => {
      if (!missile) return false
      missile.y -= missile.speed * timeScale
      missile.speed = Math.min(15, missile.speed + 0.5 * timeScale)
      return missile.y > -50 && missile.y < canvas.height + 50
    })
    // Enforce hard limit after filtering
    if (state.missiles.length > MAX_MISSILES) {
      state.missiles = state.missiles.slice(0, MAX_MISSILES)
    }
  }

  const updateEnemyBullets = (state) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const timeScale = Math.min(state.deltaTime / 16.67, 2)
    // Limit enemy bullets to prevent performance issues
    const MAX_ENEMY_BULLETS = 200
    state.enemyBullets = state.enemyBullets.slice(0, MAX_ENEMY_BULLETS).filter((bullet) => {
      bullet.y += bullet.speed * timeScale
      return bullet.y < canvas.height + 50
    })
  }

  const updatePlasmaBeams = (state) => {
    const timeScale = Math.min(state.deltaTime / 16.67, 2)
    // Limit plasma beams to prevent performance issues
    const MAX_PLASMA_BEAMS = 30
    state.plasmaBeams = state.plasmaBeams.filter((beam) => {
      if (!beam || typeof beam.life !== 'number') return false
      beam.y -= 12 * timeScale
      beam.life--
      return beam.life > 0 && beam.y > -50
    })
    // Enforce hard limit after filtering
    if (state.plasmaBeams.length > MAX_PLASMA_BEAMS) {
      state.plasmaBeams = state.plasmaBeams.slice(0, MAX_PLASMA_BEAMS)
    }
  }

  const updateAsteroids = (state) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const timeScale = Math.min(state.deltaTime / 16.67, 2)
    // Limit asteroids to prevent performance issues
    const MAX_ASTEROIDS = 40
    state.asteroids = state.asteroids.filter((asteroid) => {
      if (!asteroid) return false
      // Foreground asteroids fall like enemies and can be destroyed
      // vx small drift, vy is main downward speed
      asteroid.x += (asteroid.vx || 0) * timeScale
      asteroid.y += asteroid.vy || 1.2 * timeScale
      asteroid.rotation += 0.02 * timeScale
      // Despawn once out of screen
      return asteroid.y < canvas.height + 60
    })
    // Enforce hard limit after filtering
    if (state.asteroids.length > MAX_ASTEROIDS) {
      state.asteroids = state.asteroids.slice(0, MAX_ASTEROIDS)
    }
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

  // Update engine trails
  const updateEngineTrails = (state) => {
    const MAX_TRAILS = 20
    state.engineTrails = state.engineTrails.filter((trail) => {
      if (!trail || typeof trail.life !== 'number') return false
      trail.x += trail.vx
      trail.y += trail.vy
      trail.life--
      trail.alpha = trail.life / 20
      return trail.life > 0 && trail.y < (canvasRef.current?.height || 1000) + 50
    })
    // Enforce hard limit after filtering
    if (state.engineTrails.length > MAX_TRAILS) {
      state.engineTrails = state.engineTrails.slice(-MAX_TRAILS)
    }
  }

  // Update score popups
  const updateScorePopups = (state) => {
    state.scorePopups = state.scorePopups.filter((popup) => {
      popup.y += popup.vy
      popup.life--
      popup.scale = 1 + (60 - popup.life) / 60 * 0.5
      popup.alpha = popup.life / 60
      return popup.life > 0
    })
  }

  // Update combo effects (using expanded system)
  const updateComboEffects = (state) => {
    const MAX_COMBO_EFFECTS = 10
    if (state.comboEffects && state.comboEffects.length > 0) {
      state.comboEffects = updateComboEffectsUtil(state.comboEffects)
      // Enforce hard limit after updating
      if (state.comboEffects.length > MAX_COMBO_EFFECTS) {
        state.comboEffects = state.comboEffects.slice(-MAX_COMBO_EFFECTS)
      }
    }
  }

  // Update wave transition
  const updateWaveTransition = (state) => {
    if (state.waveTransition) {
      state.waveTransition.life--
      if (state.waveTransition.life <= 0) {
        state.waveTransition = null
      }
    }
  }

  // Draw engine trails
  const drawEngineTrails = (ctx, state) => {
    state.engineTrails.forEach((trail) => {
      ctx.fillStyle = trail.color
      ctx.globalAlpha = trail.alpha || 0.6
      ctx.beginPath()
      ctx.arc(trail.x, trail.y, trail.size, 0, Math.PI * 2)
      ctx.fill()
    })
    ctx.globalAlpha = 1
  }

  // Draw score popups
  const drawScorePopups = (ctx, state) => {
    state.scorePopups.forEach((popup) => {
      ctx.save()
      ctx.translate(popup.x, popup.y)
      ctx.scale(popup.scale, popup.scale)
      ctx.globalAlpha = popup.alpha
      ctx.font = 'bold 20px Arial'
      ctx.fillStyle = '#ffff00'
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = 3
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const text = `+${popup.value}`
      ctx.strokeText(text, 0, 0)
      ctx.fillText(text, 0, 0)
      ctx.restore()
    })
  }

  // Draw combo effects (expanded system)
  const drawComboEffects = (ctx, state) => {
    state.comboEffects.forEach((effect) => {
      ctx.save()
      
      if (effect.type === 'text' || effect.type === 'milestone') {
        ctx.translate(effect.x, effect.y)
        const alpha = effect.life / (effect.type === 'milestone' ? 90 : 60)
        ctx.globalAlpha = alpha
        ctx.font = `bold ${effect.size || 20}px Arial`
        ctx.fillStyle = effect.color || '#ff00ff'
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 4
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.strokeText(effect.text, 0, 0)
        ctx.fillText(effect.text, 0, 0)
      } else if (effect.type === 'particle') {
        ctx.globalAlpha = effect.life / 30
        ctx.fillStyle = effect.color || '#ff00ff'
        ctx.beginPath()
        ctx.arc(effect.x, effect.y, effect.size || 3, 0, Math.PI * 2)
        ctx.fill()
      }
      
      ctx.restore()
    })
  }
  
  // Draw environmental hazards
  const drawHazards = (ctx, state) => {
    if (!state.hazards || state.hazards.length === 0) return
    state.hazards.forEach((hazard) => {
      ctx.save()
      
      if (hazard.pulse) {
        const pulseScale = 1 + Math.sin(Date.now() / 200) * 0.2
        ctx.globalAlpha = 0.6 + Math.sin(Date.now() / 200) * 0.2
        ctx.scale(pulseScale, pulseScale)
      } else {
        ctx.globalAlpha = 0.8
      }
      
      ctx.fillStyle = hazard.color
      ctx.strokeStyle = hazard.color
      ctx.lineWidth = 2
      
      // Draw hazard based on type
      if (hazard.type === 'movingObstacle') {
        ctx.fillRect(
          hazard.x - hazard.width / 2,
          hazard.y - hazard.height / 2,
          hazard.width,
          hazard.height
        )
        ctx.strokeRect(
          hazard.x - hazard.width / 2,
          hazard.y - hazard.height / 2,
          hazard.width,
          hazard.height
        )
      } else if (hazard.type === 'damageZone' || hazard.type === 'energyField') {
        ctx.beginPath()
        ctx.arc(hazard.x, hazard.y, hazard.width / 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
      }
      
      ctx.restore()
    })
  }

  // Draw wave transition
  const drawWaveTransition = (ctx, state) => {
    if (!state.waveTransition) return
    const canvas = canvasRef.current
    if (!canvas) return

    const alpha = Math.min(1, state.waveTransition.life / 30)
    ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.8})`
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (state.waveTransition.life > 30) {
      ctx.font = 'bold 48px Arial'
      ctx.fillStyle = '#ffffff'
      ctx.strokeStyle = '#ff00ff'
      ctx.lineWidth = 4
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const text = `WAVE ${state.waveTransition.wave}`
      ctx.strokeText(text, canvas.width / 2, canvas.height / 2)
      ctx.fillText(text, canvas.width / 2, canvas.height / 2)
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

  // Pre-calculated star data for performance (avoid Math.random every frame)
  const getStars = (canvasWidth, canvasHeight) => {
    // Only regenerate if canvas size changed significantly or first time
    if (!starsRef.current || 
        Math.abs(starsRef.current.width - canvasWidth) > 100 ||
        Math.abs(starsRef.current.height - canvasHeight) > 100) {
      const stars = []
      const starCount = 60 // Reduced from 80 for better performance
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: (i * 83) % canvasWidth,
          baseY: (i * 73) % canvasHeight,
          brightness: 0.3 + Math.random() * 0.7, // Pre-calculated brightness
          size: 1 + Math.random() * 1.5, // Pre-calculated size
        })
      }
      starsRef.current = { stars, width: canvasWidth, height: canvasHeight }
    }
    return starsRef.current.stars
  }
  
  const drawStarfield = (ctx, offset = 0) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const canvasWidth = canvas.width
    const canvasHeight = canvas.height
    const stars = getStars(canvasWidth, canvasHeight)
    
    // Batch draw stars with pre-calculated values
    for (let i = 0; i < stars.length; i++) {
      const star = stars[i]
      const y = (star.baseY + offset) % canvasHeight
      ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`
      ctx.fillRect(star.x, y, star.size, star.size)
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

  // Type-specific boss drawing function with unique designs for each boss
  const drawBossByType = (ctx, boss, bossType, time, healthRatio, isDamaged) => {
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
        // Main body - irregular jagged shape
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

        // Metallic ore veins
        ctx.strokeStyle = '#ffd700'
        ctx.lineWidth = 2
        for (let i = 0; i < 4; i++) {
          const angle = (Math.PI / 2) * i + time * 0.1
          ctx.beginPath()
          ctx.moveTo(0, 0)
          ctx.lineTo(Math.cos(angle) * w / 3, Math.sin(angle) * h / 3)
          ctx.stroke()
        }

        // Crystalline formations
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

        // Simple projectile launchers
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
        // Alien Mothership - Organic, flowing, bioluminescent
        // Main body - organic flowing shape
        const bodyGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, w / 2)
        bodyGradient.addColorStop(0, color)
        bodyGradient.addColorStop(0.5, color + 'aa')
        bodyGradient.addColorStop(1, '#000000')
        ctx.fillStyle = bodyGradient

        // Organic oval shape with flowing curves
        ctx.beginPath()
        ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2)
        ctx.fill()

        // Bioluminescent patterns
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

        // Energy tendrils
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
        // Mechanical Overlord - Angular, industrial, heavily armored
        // Main body - angular industrial design
        const bodyGradient = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2)
        bodyGradient.addColorStop(0, color)
        bodyGradient.addColorStop(0.3, '#666666')
        bodyGradient.addColorStop(0.6, '#333333')
        bodyGradient.addColorStop(1, '#000000')
        ctx.fillStyle = bodyGradient

        // Hexagonal industrial shape
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

        // Panel lines for industrial look
        ctx.strokeStyle = '#222222'
        ctx.lineWidth = 1
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i
          ctx.beginPath()
          ctx.moveTo(0, 0)
          ctx.lineTo(Math.cos(angle) * w / 2, Math.sin(angle) * h / 2)
          ctx.stroke()
        }

        // Exposed mechanical parts
        ctx.fillStyle = '#ff6600'
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i
          const dist = w / 3
          const px = Math.cos(angle) * dist
          const py = Math.sin(angle) * dist
          // Gear/piston
          ctx.beginPath()
          ctx.arc(px, py, 6, 0, Math.PI * 2)
          ctx.fill()
        }

        // Railgun turrets
        for (let i = 0; i < 4; i++) {
          const angle = (Math.PI / 2) * i + time * 0.1
          const dist = w / 2 - 8
          const tx = Math.cos(angle) * dist
          const ty = Math.sin(angle) * dist
          // Turret base
          ctx.fillStyle = '#444444'
          ctx.fillRect(tx - 6, ty - 6, 12, 12)
          // Barrel
          ctx.fillStyle = '#222222'
          ctx.fillRect(tx - 2, ty - 15, 4, 12)
          // Glow
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
        // Space Dragon - Serpentine, elongated, mystical
        // Main body - elongated serpentine shape
        const bodyGradient = ctx.createLinearGradient(0, -h / 2, 0, h / 2)
        bodyGradient.addColorStop(0, color)
        bodyGradient.addColorStop(0.3, '#cc0000')
        bodyGradient.addColorStop(0.7, '#990000')
        bodyGradient.addColorStop(1, '#000000')
        ctx.fillStyle = bodyGradient

        // Elongated body
        ctx.beginPath()
        ctx.ellipse(0, 0, w / 2.5, h / 1.5, 0, 0, Math.PI * 2)
        ctx.fill()

        // Scales pattern
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

        // Wing-like appendages
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

        // Mystical energy core
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

        // Fire breath effect (when damaged)
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
        // Enhanced default octagonal design
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

        // Metallic rim
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
    // Inner armor plates
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

    // Pulsing energy core (universal)
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

    // Damage effects - sparks
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

    // Shield effect when healthy
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

  const drawBoss = (ctx, state) => {
    if (!state.boss) return

    const time = Date.now() / 1000
    const pulse = Math.sin(time * 2) * 0.05 + 0.95 // Subtle pulse
    const rotation = time * 0.05 // Slower rotation
    // Calculate health ratio safely (avoid division by zero)
    const bossMaxHealthForRatio = state.boss.maxHealth || state.boss.health || 1
    const healthRatio = Math.max(0, Math.min(1, (state.boss.health || 0) / bossMaxHealthForRatio))
    const isDamaged = healthRatio < 0.5

    // Try to load and use boss ship image
    const bossImg = getBossImage(state.boss.type || 'asteroid')

    ctx.save()
    ctx.translate(state.boss.x, state.boss.y)

    if (bossImg && bossImg.width) {
      // Draw using loaded image with enhanced effects
      ctx.rotate(rotation)
      ctx.globalAlpha = 0.95 + Math.sin(time * 3) * 0.05
      
      // Add glow effect behind image
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
      // Type-specific boss designs with unique visuals for each boss type
      const bossType = state.boss.type || 'asteroid'
      ctx.rotate(rotation)
      ctx.scale(pulse, pulse)
      
      // Draw type-specific boss design
      drawBossByType(ctx, state.boss, bossType, time, healthRatio, isDamaged)
    }

    ctx.restore()

    // Enhanced boss health bar with better design
    const barWidth = Math.max(150, state.boss.width * 0.8)
    const barHeight = 14
    const barX = state.boss.x - barWidth / 2
    const barY = state.boss.y - state.boss.height / 2 - 50

    const bossMaxHealth = state.boss.maxHealth || state.boss.health || 1
    const healthPercent = Math.max(0, Math.min(1, (state.boss.health || 0) / bossMaxHealth))

    // Outer glow
    ctx.shadowBlur = 20
    ctx.shadowColor = state.boss.color
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
    ctx.fillRect(barX - 4, barY - 4, barWidth + 8, barHeight + 8)
    ctx.shadowBlur = 0

    // Background bar with gradient
    const bgGradient = ctx.createLinearGradient(barX, barY, barX, barY + barHeight)
    bgGradient.addColorStop(0, '#330000')
    bgGradient.addColorStop(1, '#660000')
    ctx.fillStyle = bgGradient
    ctx.fillRect(barX, barY, barWidth, barHeight)

    // Health bar with dynamic color gradient
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

    // Health bar highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight / 2)

    // Pulsing border when low health
    const borderAlpha = healthPercent < 0.3 ? 0.8 + Math.sin(time * 5) * 0.2 : 1
    ctx.strokeStyle = `rgba(255, 255, 255, ${borderAlpha})`
    ctx.lineWidth = 3
    ctx.strokeRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4)

    // Boss name label
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

    // Only trigger wave progression once per milestone (prevent multiple triggers)
    const waveMilestone = Math.floor(state.enemiesSpawned / 50)
    const lastWaveMilestone = state.lastWaveMilestone || 0
    
    if (waveMilestone > lastWaveMilestone && state.enemiesSpawned > 0) {
      state.lastWaveMilestone = waveMilestone
      const oldWave = state.wave
      state.wave++
      setWave(state.wave)
      
      // Trigger wave transition effect
      if (state.wave !== oldWave) {
        state.waveTransition = {
          wave: state.wave,
          life: 60,
        }
      }
      
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
    const livesText = `❤️ × ${livesRef.current}`
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

    // Shooting Accuracy - Always show, even at 0%
    const shotsFired = state.shotsFired || 0
    const shotsHit = state.shotsHit || 0
    let accuracy = 0
    if (shotsFired > 0) {
      accuracy = Math.round((shotsHit / shotsFired) * 100)
      accuracy = Math.max(0, Math.min(100, accuracy)) // Clamp between 0-100
    }
    
    // Set font and color
    ctx.font = isMobile ? 'bold 12px Arial' : 'bold 13px Arial'
    if (accuracy >= 70) {
      ctx.fillStyle = '#2ecc71' // Green
    } else if (accuracy >= 50) {
      ctx.fillStyle = '#f39c12' // Orange
    } else {
      ctx.fillStyle = '#e74c3c' // Red
    }
    
    // Always display accuracy
    const accuracyText = `ACC: ${accuracy}%`
    const accWidth = ctx.measureText(accuracyText).width
    // Store accuracy Y position BEFORE drawing (for mobile weapon placement)
    const accuracyStartY = y
    
    // Ensure it's visible - use fillText directly to guarantee it renders
    if (isMobile && x + accWidth > cw - rightReserve) {
      x = 10
      y = row2Y
    }
    ctx.fillText(accuracyText, x, y)
    const accuracyEndY = y  // Store Y position AFTER drawing accuracy
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

    // Kills and Coins
    ctx.fillStyle = '#95a5a6'
    ctx.font = isMobile ? '11px Arial' : '12px Arial'
    const killsText = `Kills: ${state.currentKills || 0}`
    place(killsText)
    const coinsText = `💰 ${state.coins}`
    place(coinsText)

    // Current weapon - On mobile, ALWAYS put BELOW accuracy (on row 2) to prevent overlap
    ctx.fillStyle = '#4ecdc4'
    ctx.font = isMobile ? 'bold 11px Arial' : 'bold 12px Arial'
    const weaponText = `⚔️ ${state.currentWeapon.toUpperCase()}`
    const weaponWidth = ctx.measureText(weaponText).width
    
    // On mobile: ALWAYS place weapon on a NEW ROW below accuracy
    if (isMobile) {
      // Calculate row height (difference between row2Y and initial row)
      const initialRowY = 22  // Initial Y position for first row
      const rowHeight = row2Y - initialRowY
      
      // If accuracy is on row 1, weapon goes to row 2
      // If accuracy wrapped to row 2, weapon goes to row 3
      if (accuracyEndY === accuracyStartY && accuracyStartY === initialRowY) {
        // Accuracy stayed on row 1, weapon goes to row 2
        x = 10
        y = row2Y
      } else {
        // Accuracy wrapped or is on row 2, weapon goes to row 3
        x = 10
        y = row2Y + rowHeight
      }
    } else if (x + weaponWidth > cw - rightReserve) {
      // Desktop: normal wrap
      x = 10
      y = row2Y
    }
    
    ctx.fillText(weaponText, x, y)
    x += weaponWidth + pad

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
      {!isPaused && (
        <button
          onClick={onPause}
          aria-label="Pause Game"
          className="pause-button"
          style={{
            position: 'fixed',
            top: 14,
            right: 14,
            zIndex: 100,
            background: 'rgba(0,0,0,0.6)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: 10,
            padding: '8px 12px',
            cursor: 'pointer',
            backdropFilter: 'blur(4px)'
          }}
        >
          ⏸️ Pause
        </button>
      )}
      {isPaused && (
        <div className="pause-overlay">
          <h2>Game Paused</h2>
          <p>Press 'P' or tap a button</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={onPause}
              aria-label="Resume Game"
              style={{
                marginTop: 12,
                background: 'rgba(0,0,0,0.6)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: 10,
                padding: '8px 16px',
                cursor: 'pointer'
              }}
            >
              ▶️ Resume
            </button>
            <button
              onClick={() => {
                try {
                  const s = gameState.current || {}
                  const snapshot = {
                    score,
                    wave,
                    level,
                    combo,
                    killStreak,
                    lives: livesRef.current,
                    health: healthRef.current,
                    player: s.player,
                    currentWeapon: s.currentWeapon,
                    coins: s.coins || 0,
                    upgrades: {
                      shield: s.shield || false,
                      rapid: s.rapidFire || false,
                      speed: s.player?.speed || 5,
                      coinDoubler: s.coinDoubler || false
                    },
                    dailyChallenge: s.dailyChallenge ?? null,
                    timestamp: Date.now()
                  }
                  localStorage.setItem('savedRun', JSON.stringify(snapshot))
                } catch (_) {}
              }}
              aria-label="Save Game"
              style={{
                marginTop: 12,
                background: 'rgba(0,0,0,0.6)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: 10,
                padding: '8px 16px',
                cursor: 'pointer'
              }}
            >
              💾 Save
            </button>
            <button
              onClick={() => {
                const s = gameState.current || {}
                onGameOver(score, wave, level, s.currentKills || 0, combo)
              }}
              aria-label="End Game"
              style={{
                marginTop: 12,
                background: 'rgba(120,0,0,0.7)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: 10,
                padding: '8px 16px',
                cursor: 'pointer'
              }}
            >
              🛑 End Game
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Game
