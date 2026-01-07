import React, { useRef, useEffect, useState } from 'react'
import { playSound, ensureSfxUnlocked } from '../utils/sounds'
import { playGameplayMusic, ensureMusicPlaying } from '../utils/music'
import { saveSaveSlot, loadSaveSlot } from '../utils/firebaseData'
import './Game.css'

function Game({ selectedCharacter, selectedShip, difficulty, onGameOver }) {
  // Define helper functions BEFORE useState to avoid initialization issues
  const difficultyModifier = () => {
    return difficulty === 'easy' ? 1 : difficulty === 'medium' ? 1.5 : 2
  }

  const getDamageAmount = () => {
    // Easy: 5 damage per hit, Medium: 10 damage, Hard: 15 damage
    return difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 15
  }

  const getStartingLives = () => {
    // Easy: 25 lives, Medium: 15 lives, Hard: 10 lives
    return difficulty === 'easy' ? 25 : difficulty === 'medium' ? 15 : 10
  }

  const canvasRef = useRef()
  const pausedRef = useRef(false)
  const gameOverRef = useRef(false)
  const gameStateRef = useRef({
    player: { x: 400, y: 550, width: 40, height: 40 },
    enemies: [],
    bullets: [],
    enemyBullets: [],
    missiles: [],
    plasmaBeams: [],
    powerUps: [],
    particles: [],
    asteroids: [],
    boss: null,
    scorePopups: [],
    comboEffects: [],
    coins: 0,
    currentScore: 0,
    currentKills: 0,
    lastEnemySpawn: Date.now(),
    lastBulletShot: Date.now(),
    deltaTime: 0,
    lastFrameTime: Date.now(),
    scoreMultiplier: 1,
    damageMul: 1,
    comboMultiplier: 1.0,
    keys: {},
    shield: false,
    rapidFire: false,
    slowMotion: false,
    coinDoubler: false,
    invulnerable: false,
    currentWeapon: 'laser',
    shotsFired: 0,
    shotsHit: 0,
    enemiesSpawned: 0,
    nextFormationId: 0,
    wave: 1,
    level: 1,
    shakeIntensity: 0,
    customization: {},
    activePowerUps: {},
    waveStartTime: Date.now(),
    showWaveAnnouncement: false,
    bossWaveNext: false,
    stars: [], // Starfield for space background
    fps: 60,
    frameCount: 0,
    lastFpsUpdate: Date.now(),
  })

  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [killStreak, setKillStreak] = useState(0)
  const [enemiesKilled, setEnemiesKilled] = useState(0)
  const [paused, setPaused] = useState(false)
  const [health, setHealth] = useState(100)
  const [lives, setLives] = useState(getStartingLives())
  const [wave, setWave] = useState(1)
  const [level, setLevel] = useState(1)
  const [coins, setCoins] = useState(0)
  const [unlockedAchievements, setUnlockedAchievements] = useState({})
  const [toast, setToast] = useState('')
  const healthRef = useRef(100)
  const livesRef = useRef(getStartingLives())
  const scoreRef = useRef(0)
  const timeoutRefs = useRef([])
  const playerInput = useRef({ x: 0, y: 0, firing: false })

  const getPersonalBest = () => localStorage.getItem('personalBest') || 0

  // Keep refs in sync with state for use inside the game loop
  useEffect(() => {
    scoreRef.current = score
  }, [score])
  useEffect(() => {
    livesRef.current = lives
    if (lives <= 0 && !gameOverRef.current) {
      gameOverRef.current = true
      if (onGameOver) {
        onGameOver(scoreRef.current || score, wave, level, enemiesKilled, combo)
      }
    }
  }, [lives, onGameOver, score, wave, level, enemiesKilled, combo])

  const getWeaponColor = (weapon) => {
    // Map weapons to their visual colors
    const weaponColors = {
      laser: '#00ffff',
      spread: '#ffd700',
      plasma: '#ff00ff',
      missile: '#ff6600',
      shotgun: '#ffaa00',
      flamethrower: '#ff4400',
      freeze: '#00aaff',
      electric: '#ffff00',
      poison: '#00ff00',
      explosive: '#ff0000',
      piercing: '#ff1493',
      homing: '#00ff99',
      bounce: '#ffccaa',
      beam: '#00ccff',
      laserRifle: '#0088ff',
      minigun: '#888888',
      railgun: '#00ffff',
      cluster: '#ffaaff',
      shockwave: '#ffff99',
      flak: '#ccaa00',
      cryo: '#00ccff',
      plasma_rifle: '#ff00ff',
      rocket: '#ff6600',
      acid: '#00ff00',
      laserBeam: '#00ddff',
      grenade: '#ff9900',
      sniper: '#0099ff',
      machinegun: '#999999',
      volcano: '#ff3300',
      nuclear: '#ffff00',
      ultimate: '#ff00ff',
    }
    return weaponColors[weapon] || '#00ffff'
  }

  const initStarfield = (canvas) => {
    const stars = []
    const numStars = 150
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 2 + 0.5,
        brightness: Math.random() * 0.5 + 0.5,
      })
    }
    return stars
  }

  const drawStarfield = (ctx, canvas, stars) => {
    if (!stars || stars.length === 0) return
    
    stars.forEach((star) => {
      // Move star downward
      star.y += star.speed
      
      // Wrap around when star goes off screen
      if (star.y > canvas.height) {
        star.y = 0
        star.x = Math.random() * canvas.width
      }
      
      // Draw star with twinkling effect
      const twinkle = Math.sin(Date.now() / 1000 + star.x) * 0.3 + 0.7
      ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness * twinkle})`
      ctx.fillRect(star.x, star.y, star.size, star.size)
    })
  }

  const drawPlayer = (ctx, state) => {
    ctx.save()
    let baseShipColor = '#4ecdc4'
    let baseAccentColor = '#00ffff'
    if (selectedCharacter === 'adelynn') {
      baseShipColor = '#ff6b9a'
      baseAccentColor = '#ff00ff'
    } else if (selectedShip !== 'kaden') {
      baseShipColor = '#ff6b6b'
      baseAccentColor = '#ff00ff'
    }

    const shipColor = baseShipColor
    const accentColor = baseAccentColor

    if (state.invulnerable) {
      ctx.globalAlpha = 0.6 + Math.sin(Date.now() / 200) * 0.2
    }

    // Enhanced glow effect
    ctx.shadowBlur = 15
    ctx.shadowColor = accentColor
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0

    // Main ship body gradient
    const shipGrad = ctx.createLinearGradient(state.player.x, state.player.y, state.player.x, state.player.y + state.player.height)
    shipGrad.addColorStop(0, shipColor)
    shipGrad.addColorStop(1, '#1a7f7a')
    ctx.fillStyle = shipGrad
    ctx.beginPath()
    ctx.moveTo(state.player.x + state.player.width / 2, state.player.y)
    ctx.lineTo(state.player.x + state.player.width, state.player.y + state.player.height - 10)
    ctx.lineTo(state.player.x + state.player.width * 0.8, state.player.y + state.player.height)
    ctx.lineTo(state.player.x + state.player.width * 0.2, state.player.y + state.player.height)
    ctx.lineTo(state.player.x, state.player.y + state.player.height - 10)
    ctx.closePath()
    ctx.fill()

    // Glowing cockpit
    ctx.fillStyle = accentColor
    ctx.shadowColor = accentColor
    ctx.shadowBlur = 8
    ctx.fillRect(
      state.player.x + state.player.width * 0.35,
      state.player.y + state.player.height * 0.5,
      state.player.width * 0.3,
      state.player.height * 0.3
    )

    ctx.restore()
  }

  const drawEnemies = (ctx, state) => {
    state.enemies.forEach((enemy) => {
      ctx.save()
      
      // Determine visual style based on enemy type
      let shadowColor = '#ff6666'
      let primaryColor = '#ff3333'
      let accentColor = '#ff9999'
      let borderColor = '#ff6666'
      let size = 30
      let shape = 'triangle' // triangle, circle, diamond, square
      
      // Enemy type visuals
      if (enemy.type === 'fast') {
        // Fast enemies: magenta, smaller, lightning bolt shape
        primaryColor = '#ff00ff'
        shadowColor = '#ff00ff'
        accentColor = '#ffaaff'
        borderColor = '#ff00ff'
        size = 25
        shape = 'diamond'
      } else if (enemy.type === 'tank') {
        // Tank enemies: orange, larger, more health bars
        primaryColor = '#ff9900'
        shadowColor = '#ff9900'
        accentColor = '#ffcc66'
        borderColor = '#ff9900'
        size = 35
        shape = 'triangle' // Changed from square to triangle
      } else if (enemy.type === 'shield') {
        // Shielded enemies: cyan, with shield aura
        primaryColor = '#00ffff'
        shadowColor = '#00ffff'
        accentColor = '#66ffff'
        borderColor = '#00ffff'
        size = 32
        shape = 'circle'
      } else if (enemy.isSilver) {
        // Silver enemies: white/silver
        primaryColor = '#e8e8e8'
        shadowColor = '#e0e0e0'
        accentColor = '#ffffff'
        borderColor = '#c0c0c0'
        size = 30
        shape = 'triangle'
      } else {
        // Normal enemies: red
        primaryColor = '#ff3333'
        shadowColor = '#ff6666'
        accentColor = '#ff9999'
        borderColor = '#ff6666'
        size = 30
        shape = 'triangle'
      }
      
      // Enhanced glow
      ctx.shadowBlur = 12
      ctx.shadowColor = shadowColor
      
      // Draw gradient background
      const grad = ctx.createLinearGradient(enemy.x, enemy.y, enemy.x + size, enemy.y + size)
      grad.addColorStop(0, primaryColor)
      grad.addColorStop(1, accentColor)
      ctx.fillStyle = grad
      ctx.strokeStyle = borderColor
      ctx.lineWidth = 2.5
      
      // Draw enemy shape based on type
      ctx.beginPath()
      if (shape === 'triangle') {
        ctx.moveTo(enemy.x + size / 2, enemy.y)
        ctx.lineTo(enemy.x + 5, enemy.y + size - 5)
        ctx.lineTo(enemy.x + size - 5, enemy.y + size - 5)
      } else if (shape === 'diamond') {
        ctx.moveTo(enemy.x + size / 2, enemy.y)
        ctx.lineTo(enemy.x + size, enemy.y + size / 2)
        ctx.lineTo(enemy.x + size / 2, enemy.y + size)
        ctx.lineTo(enemy.x, enemy.y + size / 2)
      } else if (shape === 'square') {
        ctx.rect(enemy.x, enemy.y, size, size)
      } else if (shape === 'circle') {
        ctx.arc(enemy.x + size / 2, enemy.y + size / 2, size / 2, 0, Math.PI * 2)
      }
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      // Draw shield aura for shielded enemies
      if (enemy.type === 'shield') {
        ctx.strokeStyle = `rgba(0, 255, 255, 0.5)`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(enemy.x + size / 2, enemy.y + size / 2, size / 2 + 8, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Enhanced core glow (health indicator)
      ctx.shadowBlur = 8
      ctx.fillStyle = accentColor
      const healthPercent = Math.min(1, enemy.health / (enemy.type === 'tank' ? 3 : enemy.type === 'shield' ? 2 : 1))
      ctx.globalAlpha = healthPercent
      ctx.beginPath()
      ctx.arc(enemy.x + size / 2, enemy.y + size / 3, 4, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1
      
      // Draw health bars for multi-health enemies
      if (enemy.health > 1) {
        ctx.fillStyle = primaryColor
        ctx.strokeStyle = borderColor
        ctx.lineWidth = 1
        const barWidth = size
        const barHeight = 2
        ctx.strokeRect(enemy.x, enemy.y - 6, barWidth, barHeight)
        ctx.fillRect(enemy.x, enemy.y - 6, barWidth * healthPercent, barHeight)
      }

      ctx.restore()
    })
  }

  const drawBullets = (ctx, state) => {
    const bullets = state.bullets
    const len = bullets.length

    for (let i = 0; i < len; i++) {
      const bullet = bullets[i]
      if (!bullet) continue

      const color = bullet.color || (bullet.owner === 'player' ? '#00ffff' : '#ff3333')
      const bw = bullet.width || 5
      const bh = bullet.height || 10

      // Draw bullet trail
      if (bullet.trailLength && bullet.trailLength.length > 1) {
        ctx.strokeStyle = color
        ctx.globalAlpha = 0.4
        ctx.lineWidth = bw * 0.8
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.beginPath()
        ctx.moveTo(bullet.trailLength[0].x, bullet.trailLength[0].y)
        for (let j = 1; j < bullet.trailLength.length; j++) {
          const alpha = j / bullet.trailLength.length
          ctx.globalAlpha = 0.3 * alpha
          ctx.lineTo(bullet.trailLength[j].x, bullet.trailLength[j].y)
        }
        ctx.stroke()
        ctx.globalAlpha = 1
      }

      // Enhanced glow effect for bullets
      ctx.shadowBlur = 10
      ctx.shadowColor = color
      ctx.fillStyle = color
      ctx.fillRect(bullet.x, bullet.y, bw, bh)
      
      // Inner bright core
      ctx.shadowBlur = 0
      ctx.fillStyle = '#ffffff'
      ctx.globalAlpha = 0.6
      ctx.fillRect(bullet.x + 1, bullet.y + 2, bw - 2, bh - 4)
      ctx.globalAlpha = 1
    }
  }

  const drawUI = (ctx, state) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const cw = canvas.width
    const ch = canvas.height
    const isMobile = cw < 520
    // Increase bar height for readability on small screens
    const barH = isMobile ? (cw < 400 ? 80 : 70) : 70
    // Increase top margin on mobile to avoid notch/safe area - more space needed for iPhone notch
    const topMargin = isMobile ? 35 : 0

    // Enhanced scoreboard background with gradient
    const bgGrad = ctx.createLinearGradient(0, topMargin, 0, topMargin + barH)
    bgGrad.addColorStop(0, 'rgba(0, 0, 0, 0.9)')
    bgGrad.addColorStop(1, 'rgba(20, 20, 40, 0.95)')
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, topMargin, cw, barH)
    
    // Top border accent
    ctx.strokeStyle = '#4ecdc4'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, topMargin + barH)
    ctx.lineTo(cw, topMargin + barH)
    ctx.stroke()

    // Larger font for mobile for readability
    const fontSize = isMobile ? (cw < 400 ? 10.5 : 12) : 12
    ctx.font = `bold ${fontSize}px "Courier New"`
    const lineHeight = isMobile ? (cw < 400 ? 20 : 22) : 22
    let row = 0
    let col = 0
    // On very small screens, show 2 columns instead of 4
    const cols = isMobile && cw < 400 ? 2 : 4
    const colWidth = cw / cols
    const padding = isMobile ? 6 : 12
    
    const placeItem = (label, value, color) => {
      const y = topMargin + padding + 2 + row * lineHeight
      const x = (isMobile && cw < 400 ? 15 : 55) + col * colWidth
      
      // Subtle pulse for readability + stronger contrast
      const pulse = 0.9 + 0.1 * Math.sin(Date.now() / 600)
      ctx.globalAlpha = pulse
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)'
      ctx.shadowBlur = 4
      ctx.shadowOffsetX = 0.5
      ctx.shadowOffsetY = 0.5
      ctx.fillStyle = color
      ctx.fillText(`${label} ${value}`, x, y)
      ctx.shadowBlur = 0
      ctx.globalAlpha = 1
      
      col++
      if (col >= cols) {
        col = 0
        row++
      }
    }

    // Row 1: Score, Lives, HP, Coins
    const currentScore = state.currentScore || score
    placeItem('⭐ SCORE', currentScore.toString().padStart(6, '0'), '#ffd700')
    placeItem('❤ LIVES', livesRef.current, '#ff6b6b')
    
    const healthValue = Math.round(Math.max(0, Math.min(100, healthRef.current)))
    const healthColor = healthValue <= 25 ? '#ff3333' : healthValue <= 50 ? '#ff9900' : '#00ff00'
    placeItem('♥ HP', healthValue + '%', healthColor)

    placeItem('💰 COINS', state.coins, '#ffd700')

    // Row 2: Kills, Wave, Combo, Accuracy
    placeItem('🎯 KILLS', state.currentKills || 0, '#00ffff')
    placeItem('W WAVE', state.wave, '#ff00ff')
    
    if (combo > 0) {
      const pulse = Math.sin(Date.now() / 100) * 0.4 + 0.6
      placeItem('⚡ COMBO', combo, `rgba(255, 215, 0, ${pulse})`)
    } else {
      placeItem('⚡ COMBO', '0', '#666666')
    }
    
    // Shooting accuracy
    const accuracy = state.shotsFired > 0 ? Math.round((state.shotsHit / state.shotsFired) * 100) : 0
    const accColor = accuracy >= 75 ? '#00ff00' : accuracy >= 50 ? '#ffff00' : '#ff6b6b'
    placeItem('🎯 ACC', accuracy + '%', accColor)
    
    // Row 3: Weapon
    const wpn = state.currentWeapon.charAt(0).toUpperCase() + state.currentWeapon.slice(1).toLowerCase()
    placeItem('⚔ WPN', wpn, '#00ff99')
    
    // Row 4: FPS
    const fpsColor = state.fps >= 55 ? '#00ff00' : state.fps >= 30 ? '#ffff00' : '#ff6b6b'
    placeItem('⚙ FPS', state.fps, fpsColor)
  }

  const spawnBoss = (state) => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Spawn boss on every 5th wave (5, 10, 15, etc.)
    const shouldSpawnBoss = state.wave > 0 && state.wave % 5 === 0 && state.enemies.length === 0 && !state.boss

    if (shouldSpawnBoss) {
      const bossTypes = ['type1', 'type2', 'type3']
      const bossType = bossTypes[Math.floor(state.wave / 5) % bossTypes.length]
      
      const bossBaseHealth = 20 + state.wave * 3
      const bossHealth = Math.round(bossBaseHealth * difficultyModifier())
      
      state.boss = {
        x: canvas.width / 2 - 40,
        y: -80,
        width: 80,
        height: 80,
        health: bossHealth,
        maxHealth: bossHealth,
        speed: 1.5 + state.wave * 0.1,
        type: bossType,
        shootTimer: 0,
        shootInterval: 300 - state.wave * 10,
        pattern: 'sine',
        patternTime: 0,
        baseX: canvas.width / 2 - 40,
      }
      playSound('bossSpawn', 0.5)
    }

    // Update boss position if it exists
    if (state.boss) {
      const timeScale = Math.min(state.deltaTime / 16.67, 2)
      
      // Movement pattern
      state.boss.patternTime += timeScale
      if (state.boss.pattern === 'sine') {
        state.boss.x = state.boss.baseX + Math.sin(state.boss.patternTime / 20) * 100
      } else if (state.boss.pattern === 'figure8') {
        const t = state.boss.patternTime / 30
        state.boss.x = state.boss.baseX + Math.sin(t) * 80
      }
      
      // Keep boss in bounds
      state.boss.x = Math.max(20, Math.min(canvas.width - 100, state.boss.x))
      
      // Boss descent
      if (state.boss.y < 150) {
        state.boss.y += state.boss.speed * timeScale
      }
      
      // Boss shooting
      state.boss.shootTimer++
      if (state.boss.shootTimer > state.boss.shootInterval) {
        // Boss shoots in multiple directions
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 3) {
          state.enemyBullets.push({
            x: state.boss.x + state.boss.width / 2,
            y: state.boss.y + state.boss.height,
            vx: Math.sin(angle) * 5,
            vy: Math.cos(angle) * 5,
            width: 5,
            height: 5,
          })
        }
        playSound('missile', 0.3)
        state.boss.shootTimer = 0
      }
    }
  }

  const spawnEnemies = (state) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const now = Date.now()
    const baseRate = state.wave <= 2 ? 2600 : state.wave <= 4 ? 2200 : 1800
    let spawnRate = baseRate / difficultyModifier()

    if (now - state.lastEnemySpawn > spawnRate) {
      // Wave announcement on new waves
      if (state.enemiesSpawned === 0 || (state.enemiesSpawned > 0 && state.enemies.length === 0 && state.enemiesSpawned > state.wave * 5)) {
        state.showWaveAnnouncement = true
        state.waveStartTime = now
        playSound('level-complete', 0.2)
      }

      const patternsEarly = ['normal', 'zigzag']
      const patternsMore = ['normal', 'zigzag', 'sway', 'dash']
      const pool = state.wave < 3 ? patternsEarly : patternsMore
      const pattern = pool[Math.floor(Math.random() * pool.length)]
      
      // Enhanced enemy variety
      const enemyTypeRoll = Math.random()
      let enemyType = 'normal'
      let health = 1
      let speedMult = 1
      let color = '#ff0000'

      if (state.wave >= 5 && enemyTypeRoll < 0.15) {
        // Fast weak enemies
        enemyType = 'fast'
        health = 1
        speedMult = 2.2
        color = '#ff00ff'
      } else if (state.wave >= 3 && enemyTypeRoll < 0.25) {
        // Tank enemies
        enemyType = 'tank'
        health = 3
        speedMult = 0.6
        color = '#ffaa00'
      } else if (state.wave >= 4 && enemyTypeRoll < 0.35) {
        // Shielded
        enemyType = 'shield'
        health = 2
        speedMult = 1.1
        color = '#00ffff'
      } else {
        // Default
        health = state.wave < 3 ? 1 : 2
        speedMult = 1
        color = Math.random() > 0.7 ? '#ffff00' : '#ff0000'
      }

      const baseSpeed = difficultyModifier() * speedMult
      const baseSilverChance = state.wave >= 4 ? 0.4 : 0.25
      const isSilver = Math.random() < baseSilverChance
      
      // More aggressive speed scaling: +0.15 per wave
      const waveSpeedBonus = 1.0 + (state.wave * 0.15)
      
      const enemy = {
        x: Math.random() * (canvas.width - 30) + 15,
        y: -30,
        speed: baseSpeed * waveSpeedBonus * (isSilver ? 0.95 : 1.0),
        pattern,
        health: isSilver ? 4 : health,
        type: enemyType,
        color: color,
        isSilver: isSilver,
      }
      state.enemies.push(enemy)
      state.enemiesSpawned++

      state.lastEnemySpawn = now
    }
  }

  const spawnCollectibles = (state) => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Get all weapon names for random weapon selection
    const weaponNames = [
      'laser', 'spread', 'plasma', 'missile', 'shotgun', 'flamethrower',
      'freeze', 'electric', 'poison', 'explosive', 'piercing', 'homing',
      'bounce', 'beam', 'laserRifle', 'minigun', 'railgun', 'cluster',
      'shockwave', 'flak', 'cryo', 'plasma_rifle', 'rocket', 'acid',
      'laserBeam', 'grenade', 'sniper', 'machinegun', 'volcano', 'nuclear',
      'ultimate'
    ]

    // Spawn coins from dead enemies
    if (state.scorePopups && state.scorePopups.length > 0) {
      const toRemove = []
      for (let i = 0; i < state.scorePopups.length; i++) {
        const popup = state.scorePopups[i]
        popup.life--
        if (popup.life <= 0) {
          // Chance to spawn power-ups and weapons based on probability
          const roll = Math.random()
          if (!state.powerUps) state.powerUps = []
          
          if (roll < 0.35) {
            // 35% - coins
            state.coins++
            state.powerUps.push({
              x: popup.x,
              y: popup.y,
              type: 'coin',
              width: 20,
              height: 20,
              vy: -0.8,
            })
          } else if (roll < 0.43) {
            // 8% - health power-up
            state.powerUps.push({
              x: popup.x,
              y: popup.y,
              type: 'health',
              width: 24,
              height: 24,
              vy: -0.6,
            })
          } else if (roll < 0.50) {
            // 7% - shield power-up
            state.powerUps.push({
              x: popup.x,
              y: popup.y,
              type: 'shield',
              width: 27,
              height: 27,
              vy: -0.6,
            })
          } else if (roll < 0.56) {
            // 6% - damage boost
            state.powerUps.push({
              x: popup.x,
              y: popup.y,
              type: 'damage',
              width: 24,
              height: 24,
              vy: -0.6,
            })
          } else {
            // 44% - weapon collectible
            const randomWeapon = weaponNames[Math.floor(Math.random() * weaponNames.length)]
            state.powerUps.push({
              x: popup.x,
              y: popup.y,
              type: 'weapon',
              weapon: randomWeapon,
              width: 25,
              height: 25,
              vy: -0.7,
            })
          }
          toRemove.push(i)
        }
      }
      for (let i = toRemove.length - 1; i >= 0; i--) {
        state.scorePopups.splice(toRemove[i], 1)
      }
    }

    // Update collectibles
    if (state.powerUps && state.powerUps.length > 0) {
      const toRemove = []
      for (let i = 0; i < state.powerUps.length; i++) {
        const p = state.powerUps[i]
        p.y += p.vy
        p.vy += 0.15 // gravity (reduced from 0.3 for slower fall)
        
        // Check if player collected the power-up
        const distance = Math.hypot(
          state.player.x + state.player.width / 2 - p.x,
          state.player.y + state.player.height / 2 - p.y
        )
        
        if (distance < 30) {
          // Player collected the power-up
          if (p.type === 'coin') {
            state.coins++
            playSound('coin', 0.3)
          } else if (p.type === 'health') {
            setHealth((h) => Math.min(100, h + 20))
            playSound('powerup', 0.4)
          } else if (p.type === 'shield') {
            state.shield = true
            state.shieldTimer = 8000 // 8 seconds
            playSound('powerup', 0.4)
          } else if (p.type === 'damage') {
            state.damageMul = 2
            state.damageBoostTimer = 5000 // 5 seconds
            playSound('powerup', 0.5)
          } else if (p.type === 'weapon') {
            // Switch to collected weapon
            state.currentWeapon = p.weapon
            playSound('powerup', 0.6)
          }
          toRemove.push(i)
        } else if (p.y > canvas.height + 50) {
          toRemove.push(i)
        }
      }
      
      for (let i = toRemove.length - 1; i >= 0; i--) {
        state.powerUps.splice(toRemove[i], 1)
      }
    }
  }

  const spawnAsteroids = (state) => {
    const canvas = canvasRef.current
    if (!canvas) return

    if (!state.lastAsteroidSpawn) state.lastAsteroidSpawn = Date.now()
    const now = Date.now()
    const asteroidRate = 3000 - (state.wave * 200)

    if (now - state.lastAsteroidSpawn > asteroidRate && state.wave >= 3) {
      if (!state.asteroids) state.asteroids = []
      if (state.asteroids.length < 15) {
        const roll = Math.random()
        const asteroidSize = roll < 0.5 ? 'small' : roll < 0.85 ? 'medium' : 'large'
        state.asteroids.push({
          x: Math.random() * canvas.width,
          y: -30,
          size: asteroidSize,
          width: asteroidSize === 'small' ? 20 : asteroidSize === 'medium' ? 35 : 50,
          height: asteroidSize === 'small' ? 20 : asteroidSize === 'medium' ? 35 : 50,
          speed: 1 + Math.random() * 2,
          rotation: 0,
          rotationSpeed: Math.random() * 0.1 - 0.05,
          health: asteroidSize === 'small' ? 1 : asteroidSize === 'medium' ? 2 : 3,
          maxHealth: asteroidSize === 'small' ? 1 : asteroidSize === 'medium' ? 2 : 3,
        })
        state.lastAsteroidSpawn = now
      }
    }
  }

  const updateAsteroids = (state) => {
    const canvas = canvasRef.current
    if (!canvas || !state.asteroids) return

    const timeScale = Math.min(state.deltaTime / 16.67, 2)

    state.asteroids = state.asteroids.filter((ast) => {
      ast.y += ast.speed * timeScale
      ast.rotation += ast.rotationSpeed * timeScale
      return ast.y < canvas.height + 50
    })
  }

  const updateParticles = (state) => {
    if (!state.particles) return
    state.particles = state.particles.filter((p) => {
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.15
      p.life--
      return p.life > 0
    })
    
    // Decay screen shake
    state.shakeIntensity = Math.max(0, state.shakeIntensity - 0.15)
  }

  const drawParticles = (ctx, state) => {
    if (!state.particles) return
    state.particles.forEach((p) => {
      ctx.fillStyle = p.color
      ctx.globalAlpha = p.life / 60
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size || 2, 0, Math.PI * 2)
      ctx.fill()
    })
    ctx.globalAlpha = 1
  }

  const drawAsteroids = (ctx, state) => {
    if (!state.asteroids) return
    state.asteroids.forEach((ast) => {
      ctx.save()
      ctx.translate(ast.x, ast.y)
      ctx.rotate(ast.rotation)
      
      // Glow effect
      const health = ast.health || 1
      const maxHealth = ast.maxHealth || 1
      const healthPercent = health / maxHealth
      const glowColor = healthPercent < 0.5 ? '#ff6f47' : '#8b6f47'
      
      ctx.shadowBlur = 8
      ctx.shadowColor = glowColor
      
      // Main asteroid with gradient - irregular rocky shape
      const astGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, ast.width / 2)
      const lightColor = healthPercent < 0.5 ? '#ff9966' : '#b8956a'
      const darkColor = healthPercent < 0.5 ? '#cc5533' : '#5a4a3a'
      astGrad.addColorStop(0, lightColor)
      astGrad.addColorStop(0.6, '#8b7355')
      astGrad.addColorStop(1, darkColor)
      ctx.fillStyle = astGrad
      ctx.strokeStyle = glowColor
      ctx.lineWidth = 2
      
      // Draw irregular asteroid shape
      const radius = ast.width / 2
      const points = 8 + Math.floor(ast.width / 10) // More points for larger asteroids
      ctx.beginPath()
      for (let i = 0; i < points; i++) {
        const angle = (i / points) * Math.PI * 2
        // Use asteroid ID (or position) as seed for consistent randomness
        const seed = (ast.x * 7 + ast.y * 13 + i * 17) % 100
        const variance = 0.6 + (seed / 100) * 0.8 // 0.6 to 1.4 range
        const r = radius * variance
        const x = Math.cos(angle) * r
        const y = Math.sin(angle) * r
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      
      // Rock texture craters/highlights
      const numCraters = ast.size === 'large' ? 3 : ast.size === 'medium' ? 2 : 1
      for (let i = 0; i < numCraters; i++) {
        const seed1 = (ast.x * 11 + ast.y * 19 + i * 23) % 100
        const seed2 = (ast.x * 13 + ast.y * 17 + i * 29) % 100
        const craterX = (seed1 / 100 - 0.5) * ast.width * 0.6
        const craterY = (seed2 / 100 - 0.5) * ast.height * 0.6
        const craterSize = ast.width / (8 + i * 2)
        
        ctx.fillStyle = i % 2 === 0 ? '#c9a961' : '#a0826d'
        ctx.beginPath()
        ctx.arc(craterX, craterY, craterSize, 0, Math.PI * 2)
        ctx.fill()
      }
      
      // Health indicator for multi-health asteroids
      if (maxHealth > 1) {
        ctx.globalAlpha = 0.8
        ctx.strokeStyle = healthPercent < 0.5 ? '#ff9966' : '#ffffff'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.arc(0, 0, ast.width / 2 + 3, 0, Math.PI * 2)
        ctx.stroke()
        
        // Damage cracks
        if (healthPercent < 0.5) {
          ctx.strokeStyle = '#ff6f47'
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(-ast.width / 4, -ast.width / 4)
          ctx.lineTo(ast.width / 4, ast.width / 4)
          ctx.stroke()
          
          ctx.beginPath()
          ctx.moveTo(ast.width / 4, -ast.width / 4)
          ctx.lineTo(-ast.width / 4, ast.width / 4)
          ctx.stroke()
        }
        ctx.globalAlpha = 1
      }
      
      ctx.restore()
    })
  }

  const drawCollectibles = (ctx, state) => {
    if (!state.powerUps) return
    state.powerUps.forEach((p) => {
      if (p.type === 'coin') {
        ctx.save()
        
        // Advanced pulsing glow with rotation
        const glow = Math.sin(Date.now() / 150 + p.x) * 4 + 10
        const rotation = (Date.now() / 20) % (Math.PI * 2)
        
        // Outer glow layer
        ctx.shadowBlur = glow + 4
        ctx.shadowColor = 'rgba(255, 237, 74, 0.6)'
        ctx.fillStyle = 'rgba(255, 237, 74, 0.2)'
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.width / 1.5, 0, Math.PI * 2)
        ctx.fill()
        
        // Main glow
        ctx.shadowBlur = glow
        ctx.shadowColor = '#ffed4e'
        
        // Coin gradient with 3D effect
        const coinGrad = ctx.createRadialGradient(p.x - 2, p.y - 2, 0, p.x, p.y, p.width / 2)
        coinGrad.addColorStop(0, '#fffacd')
        coinGrad.addColorStop(0.4, '#ffed4e')
        coinGrad.addColorStop(0.7, '#ffd700')
        coinGrad.addColorStop(1, '#daa500')
        ctx.fillStyle = coinGrad
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.width / 2, 0, Math.PI * 2)
        ctx.fill()
        
        // Rotating outer ring for depth
        ctx.shadowBlur = 0
        ctx.strokeStyle = '#fff9e6'
        ctx.lineWidth = 2.5
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.width / 2, 0, Math.PI * 2)
        ctx.stroke()
        
        // Inner bright highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
        const highlightSize = p.width / 5
        ctx.beginPath()
        ctx.arc(p.x - p.width / 5, p.y - p.width / 5, highlightSize, 0, Math.PI * 2)
        ctx.fill()
        
        // Second highlight for sparkle
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
        ctx.beginPath()
        ctx.arc(p.x + p.width / 6, p.y + p.width / 6, highlightSize * 0.6, 0, Math.PI * 2)
        ctx.fill()
        
        // Dollar sign with glow
        ctx.shadowBlur = 4
        ctx.shadowColor = 'rgba(255, 107, 0, 0.8)'
        ctx.fillStyle = '#ff6b00'
        ctx.font = 'bold 10px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('$', p.x, p.y)
        
        // Optional: Rotate the coin for 3D feel
        ctx.globalAlpha = 0.3
        ctx.strokeStyle = '#ffa500'
        ctx.lineWidth = 1
        ctx.beginPath()
        const oscilate = Math.sin(Date.now() / 300) * (p.width / 3)
        ctx.arc(p.x, p.y, Math.abs(oscilate), 0, Math.PI * 2)
        ctx.stroke()
        ctx.globalAlpha = 1
        
        ctx.restore()
      } else if (p.type === 'health') {
        // Health power-up
        ctx.save()
        
        const glow = Math.sin(Date.now() / 100 + p.x) * 5 + 12
        ctx.shadowBlur = glow
        ctx.shadowColor = 'rgba(0, 255, 100, 0.8)'
        
        // Outer glow
        ctx.fillStyle = 'rgba(0, 255, 100, 0.2)'
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.width / 1.5, 0, Math.PI * 2)
        ctx.fill()
        
        // Main health cross shape
        ctx.fillStyle = '#00ff64'
        const size = p.width / 2
        ctx.fillRect(p.x - size/4, p.y - size, size/2, size*2)
        ctx.fillRect(p.x - size, p.y - size/4, size*2, size/2)
        
        // Bright core
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(p.x, p.y, size/3, 0, Math.PI * 2)
        ctx.fill()
        
        ctx.restore()
      } else if (p.type === 'shield') {
        // Shield power-up
        ctx.save()
        
        const glow = Math.sin(Date.now() / 80 + p.x) * 6 + 13
        ctx.shadowBlur = glow
        ctx.shadowColor = 'rgba(0, 200, 255, 0.8)'
        
        // Outer glow
        ctx.fillStyle = 'rgba(0, 200, 255, 0.15)'
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.width / 1.3, 0, Math.PI * 2)
        ctx.fill()
        
        // Shield shape
        ctx.strokeStyle = '#00c8ff'
        ctx.lineWidth = 2
        ctx.fillStyle = 'rgba(0, 200, 255, 0.4)'
        ctx.beginPath()
        const shieldW = p.width / 1.5
        const shieldH = p.width * 1.2
        ctx.moveTo(p.x - shieldW/2, p.y - shieldH/2)
        ctx.lineTo(p.x + shieldW/2, p.y - shieldH/2)
        ctx.lineTo(p.x + shieldW/2, p.y + shieldH/3)
        ctx.quadraticCurveTo(p.x, p.y + shieldH/2, p.x - shieldW/2, p.y + shieldH/3)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
        
        // Inner bright point
        ctx.fillStyle = '#00ffff'
        ctx.beginPath()
        ctx.arc(p.x, p.y - 2, 2, 0, Math.PI * 2)
        ctx.fill()
        
        ctx.restore()
      } else if (p.type === 'damage') {
        // Damage boost power-up
        ctx.save()
        
        const glow = Math.sin(Date.now() / 90 + p.x) * 5 + 11
        ctx.shadowBlur = glow
        ctx.shadowColor = 'rgba(255, 100, 0, 0.8)'
        
        // Outer glow
        ctx.fillStyle = 'rgba(255, 100, 0, 0.2)'
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.width / 1.4, 0, Math.PI * 2)
        ctx.fill()
        
        // Lightning bolt
        ctx.fillStyle = '#ff6400'
        ctx.strokeStyle = '#ffaa00'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(p.x, p.y - p.width/2)
        ctx.lineTo(p.x + p.width/4, p.y - p.width/6)
        ctx.lineTo(p.x + p.width/3, p.y + p.width/6)
        ctx.lineTo(p.x, p.y + p.width/2)
        ctx.lineTo(p.x - p.width/4, p.y + p.width/6)
        ctx.lineTo(p.x - p.width/3, p.y - p.width/6)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
        
        // Center glow
        ctx.fillStyle = '#ffff99'
        ctx.beginPath()
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2)
        ctx.fill()
        
        ctx.restore()
      } else if (p.type === 'weapon') {
        // Weapon collectible - bright energy crystal
        ctx.save()
        
        const glow = Math.sin(Date.now() / 60 + p.x) * 6 + 14
        const rotation = (Date.now() / 15) % (Math.PI * 2)
        
        ctx.shadowBlur = glow
        ctx.shadowColor = 'rgba(100, 200, 255, 0.8)'
        
        // Outer glow
        ctx.fillStyle = 'rgba(100, 200, 255, 0.15)'
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.width / 1.2, 0, Math.PI * 2)
        ctx.fill()
        
        // Rotating hexagon shape for weapon collectible
        ctx.strokeStyle = '#64c8ff'
        ctx.lineWidth = 1.5
        ctx.fillStyle = 'rgba(100, 200, 255, 0.5)'
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(rotation)
        
        ctx.beginPath()
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3
          const x = Math.cos(angle) * (p.width / 2)
          const y = Math.sin(angle) * (p.width / 2)
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
        ctx.restore()
        
        // Bright center core
        ctx.fillStyle = '#00ffff'
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.width / 3.5, 0, Math.PI * 2)
        ctx.fill()
        
        // Weapon indicator letter
        ctx.fillStyle = '#0088ff'
        ctx.font = 'bold 8px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        const weaponLetter = (p.weapon || 'W').charAt(0).toUpperCase()
        ctx.fillText(weaponLetter, p.x, p.y)
        
        ctx.restore()
      }
    })
  }

  const updateEnemies = (state) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const timeScale = Math.min(state.deltaTime / 16.67, 2)
    const MAX_ENEMIES = 50

    state.enemies = state.enemies.slice(0, MAX_ENEMIES).filter((enemy) => {
      enemy.y += enemy.speed * timeScale

      // Enhanced movement patterns based on enemy type
      if (enemy.type === 'fast') {
        // Fast enemies use erratic patterns
        if (!enemy.patternTime) enemy.patternTime = 0
        enemy.patternTime += timeScale
        enemy.x += Math.sin(enemy.patternTime / 10) * 4 * timeScale
        enemy.x += Math.cos(enemy.patternTime / 15) * 2 * timeScale
      } else if (enemy.pattern === 'zigzag') {
        enemy.x += Math.sin(enemy.y / 20) * 2.5 * timeScale
      } else if (enemy.pattern === 'sway') {
        enemy.x += Math.sin(enemy.y / 30) * 3.5 * timeScale
      } else if (enemy.pattern === 'dash') {
        if (Math.random() < 0.02) {
          if (!enemy.dashCooldown) enemy.dashCooldown = 0
          if (enemy.dashCooldown <= 0) {
            enemy.y += 30 * timeScale
            enemy.dashCooldown = 500
          }
        }
        if (enemy.dashCooldown) enemy.dashCooldown -= state.deltaTime
      }

      // Intelligent AI: Avoid bullets by moving toward clear areas
      if (Math.random() < 0.05 && state.enemyBullets.length < 50) {
        // Check if there's a nearby bullet
        for (let i = 0; i < state.bullets.length; i++) {
          const bullet = state.bullets[i]
          if (bullet && bullet.y < enemy.y && bullet.y + 100 > enemy.y) {
            const dist = Math.abs(bullet.x - enemy.x)
            if (dist < 80) {
              // Evasive maneuver
              if (bullet.x < enemy.x) {
                enemy.x += 8 * timeScale
              } else {
                enemy.x -= 8 * timeScale
              }
              break
            }
          }
        }
      }

      // Keep enemies within canvas bounds (left/right)
      enemy.x = Math.max(5, Math.min(canvas.width - 35, enemy.x))

      // Intelligent shooting pattern
      let shootChance = 0.01 * difficultyModifier()
      
      // Shield enemies shoot less often
      if (enemy.type === 'shield') shootChance *= 0.5
      // Tank enemies shoot more often
      else if (enemy.type === 'tank') shootChance *= 1.5
      // Fast enemies shoot more frequently
      else if (enemy.type === 'fast') shootChance *= 1.2
      
      if (Math.random() < shootChance && enemy.y > 50 && enemy.y < canvas.height - 100) {
        if (state.enemyBullets.length < 180) {
          // Smart aim: try to shoot towards player
          const playerX = state.player.x + state.player.width / 2
          const playerY = state.player.y
          const dx = playerX - (enemy.x + 15)
          const dy = playerY - (enemy.y + 30)
          const dist = Math.sqrt(dx * dx + dy * dy)
          const aim = 0.6 + (state.wave > 10 ? 0.3 : 0) // Better aim at higher waves
          
          let vx = 0
          let vy = 3
          if (Math.random() < aim && dist > 0) {
            vx = (dx / dist) * 2
            vy = Math.min(4, (dy / dist) * 3)
          }
          
          state.enemyBullets.push({
            x: enemy.x + 15,
            y: enemy.y + 30,
            vx: vx,
            vy: vy,
            speed: 3 * timeScale,
            owner: 'enemy',
            width: 3,
            height: 8,
          })
        }
      }

      return enemy.y < canvas.height + 50
    })

    if (state.enemies.length > MAX_ENEMIES) {
      state.enemies = state.enemies.slice(0, MAX_ENEMIES)
    }
  }

  const checkCollisions = (state) => {
    const bulletsToRemove = []
    const enemiesToRemove = []

    if (state.bullets.length > 0 && state.enemies.length > 0) {
      for (let i = 0; i < state.bullets.length; i++) {
        const bullet = state.bullets[i]
        if (!bullet || bullet.owner !== 'player') continue

        for (let j = 0; j < state.enemies.length; j++) {
          const enemy = state.enemies[j]
          if (!enemy) continue

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
            state.shotsHit++
            const comboMult = state.comboMultiplier || 1.0
            const points = Math.floor(10 * state.scoreMultiplier * comboMult)

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
              state.currentScore = newScore
              return newScore
            })

            const newCombo = combo + 1
            setCombo(newCombo)
            setKillStreak((k) => k + 1)
            setEnemiesKilled((e) => e + 1)
            state.currentKills = (state.currentKills || 0) + 1

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

            const dmg = Math.max(1, Math.round(state.damageMul || 1))
            enemy.health = (typeof enemy.health === 'number' ? enemy.health : 1) - dmg

            if (!bullet.pierce) bulletsToRemove.push(i)

            if (enemy.health <= 0) {
              enemiesToRemove.push(j)
              // Create explosion effect with enemy type
              createExplosion(state, enemy.x + 15, enemy.y + 15, 'medium', enemy.type)
            }
            break
          }
        }
      }
    }

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

    // Wave progression: advance wave every 50 enemies killed
    if (!state.lastWaveMilestone) state.lastWaveMilestone = 0
    const kills = state.currentKills || 0
    const waveMilestone = Math.floor(kills / 50)
    if (waveMilestone > state.lastWaveMilestone) {
      state.lastWaveMilestone = waveMilestone
      const newWave = state.wave + 1
      state.wave = newWave
      setWave(newWave)
      state.showWaveAnnouncement = true
      state.waveStartTime = Date.now()
      playSound('levelUp', 0.4)
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
            const damage = getDamageAmount()
            const newHealth = h - damage
            if (newHealth <= 0) {
              addScreenShake(state, 4)
              createExplosion(state, state.player.x + state.player.width / 2, state.player.y, 'large')
              playSound('hit', 0.3)
              setLives((l) => Math.max(0, l - 1))
              state.invulnerable = true
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

      enemiesToRemove
        .sort((a, b) => b - a)
        .forEach((index) => {
          state.enemies.splice(index, 1)
        })

      // Enemy bullets
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
            const damage = getDamageAmount()
            const newHealth = h - damage
            if (newHealth <= 0) {
              setLives((l) => Math.max(0, l - 1))
              state.invulnerable = true
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
          playSound('hit', 0.5)
        }
      }

      bulletsToRemove
        .sort((a, b) => b - a)
        .forEach((index) => {
          state.enemyBullets.splice(index, 1)
        })
    }

    // Asteroid-bullet collisions
    if (state.asteroids && state.asteroids.length > 0 && state.bullets.length > 0) {
      const asteroidsToRemove = []
      const bulletsToRemoveAst = []

      for (let i = 0; i < state.bullets.length; i++) {
        const bullet = state.bullets[i]
        if (!bullet || bullet.owner !== 'player') continue

        for (let j = 0; j < state.asteroids.length; j++) {
          const ast = state.asteroids[j]
          if (!ast) continue

          const bulletWidth = bullet.width || 5
          const bulletHeight = bullet.height || 10

          if (
            bullet.x < ast.x + ast.width &&
            bullet.x + bulletWidth > ast.x &&
            bullet.y < ast.y + ast.height &&
            bullet.y + bulletHeight > ast.y
          ) {
            // Hit the asteroid
            ast.health = (ast.health || 1) - 1
            
            if (!bullet.pierce) bulletsToRemoveAst.push(i)

            if (ast.health <= 0) {
              asteroidsToRemove.push(j)
              createExplosion(state, ast.x + ast.width / 2, ast.y + ast.height / 2, 'small')
              addScreenShake(state, 0.5)
              
              // Break large asteroids into medium pieces, medium into small
              if (ast.size === 'large') {
                // Spawn 2-3 medium asteroids
                const numPieces = 2 + Math.floor(Math.random() * 2)
                for (let k = 0; k < numPieces; k++) {
                  state.asteroids.push({
                    x: ast.x + Math.random() * 20 - 10,
                    y: ast.y + Math.random() * 20 - 10,
                    size: 'medium',
                    width: 35,
                    height: 35,
                    speed: ast.speed + Math.random() * 1,
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: Math.random() * 0.1 - 0.05,
                    health: 2,
                    maxHealth: 2,
                  })
                }
              } else if (ast.size === 'medium') {
                // Spawn 2-3 small asteroids
                const numPieces = 2 + Math.floor(Math.random() * 2)
                for (let k = 0; k < numPieces; k++) {
                  state.asteroids.push({
                    x: ast.x + Math.random() * 15 - 7.5,
                    y: ast.y + Math.random() * 15 - 7.5,
                    size: 'small',
                    width: 20,
                    height: 20,
                    speed: ast.speed + Math.random() * 1.5,
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: Math.random() * 0.1 - 0.05,
                    health: 1,
                    maxHealth: 1,
                  })
                }
              }
            }
            break
          }
        }
      }

      bulletsToRemoveAst
        .sort((a, b) => b - a)
        .forEach((index) => {
          if (state.bullets[index]) state.bullets.splice(index, 1)
        })
      asteroidsToRemove
        .sort((a, b) => b - a)
        .forEach((index) => {
          state.asteroids.splice(index, 1)
        })
    }

    // Boss-bullet collisions
    if (state.boss && state.bullets.length > 0) {
      const bulletsToRemoveBoss = []
      
      for (let i = 0; i < state.bullets.length; i++) {
        const bullet = state.bullets[i]
        if (!bullet || bullet.owner !== 'player') continue

        const bulletWidth = bullet.width || 5
        const bulletHeight = bullet.height || 10
        
        if (
          bullet.x < state.boss.x + state.boss.width &&
          bullet.x + bulletWidth > state.boss.x &&
          bullet.y < state.boss.y + state.boss.height &&
          bullet.y + bulletHeight > state.boss.y
        ) {
          // Hit the boss
          const dmg = Math.max(3, Math.round(state.damageMul || 1) * 2)
          state.boss.health -= dmg
          
          if (!bullet.pierce) bulletsToRemoveBoss.push(i)
          
          addScreenShake(state, 2)
          createExplosion(state, bullet.x, bullet.y, 'medium')
          
          if (state.boss.health <= 0) {
            // Boss defeated!
            createExplosion(state, state.boss.x + state.boss.width / 2, state.boss.y + state.boss.height / 2, 'large')
            addScreenShake(state, 5)
            playSound('bossSpawn', 0.5) // Victory sound
            
            // Spawn power-ups and coins
            for (let j = 0; j < 5; j++) {
              if (!state.powerUps) state.powerUps = []
              state.powerUps.push({
                x: state.boss.x + Math.random() * state.boss.width,
                y: state.boss.y,
                type: 'coin',
                width: 12,
                height: 12,
                vy: -3 + Math.random() * 2,
              })
            }
            state.boss = null
          }
          break
        }
      }
      
      bulletsToRemoveBoss
        .sort((a, b) => b - a)
        .forEach((index) => {
          if (state.bullets[index]) state.bullets.splice(index, 1)
        })
    }

    // Boss-player collision
    if (state.boss && !state.invulnerable && !state.shield) {
      if (
        state.player.x < state.boss.x + state.boss.width &&
        state.player.x + state.player.width > state.boss.x &&
        state.player.y < state.boss.y + state.boss.height &&
        state.player.y + state.player.height > state.boss.y
      ) {
        setHealth((h) => {
          const damage = getDamageAmount() * 3 // Boss deals triple damage
          const newHealth = h - damage
          if (newHealth <= 0) {
            addScreenShake(state, 4)
            createExplosion(state, state.player.x + state.player.width / 2, state.player.y, 'large')
            playSound('hit', 0.3)
            setLives((l) => Math.max(0, l - 1))
            state.invulnerable = true
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
      }
    }
  }

  const updateEnemyBullets = (state) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const timeScale = Math.min(state.deltaTime / 16.67, 2)

    state.enemyBullets = state.enemyBullets.filter((bullet) => {
      // Move bullet with velocity support (for angled shots)
      if (bullet.vx || bullet.vy) {
        bullet.x += (bullet.vx || 0) * timeScale
        bullet.y += (bullet.vy || 3) * timeScale
      } else {
        // Fallback to straight down movement
        const speed = bullet.speed || 3
        bullet.y += speed * timeScale
      }
      
      // Remove if off-screen
      return (
        bullet.y > -20 &&
        bullet.y < canvas.height + 20 &&
        bullet.x > -20 &&
        bullet.x < canvas.width + 20
      )
    })
  }

  const updateBullets = (state) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const timeScale = Math.min(state.deltaTime / 16.67, 2)
    const MAX_BULLETS = 300
    const now = Date.now()

    state.bullets = state.bullets.filter((bullet) => {
      if (typeof bullet.vx === 'number' || typeof bullet.vy === 'number') {
        bullet.x += (bullet.vx || 0) * timeScale
        bullet.y += (bullet.vy || -bullet.speed) * timeScale
      } else if (typeof bullet.angle === 'number') {
        const dx = Math.sin(bullet.angle) * bullet.speed
        const dy = -Math.cos(bullet.angle) * bullet.speed
        bullet.x += dx * timeScale
        bullet.y += dy * timeScale
      } else {
        bullet.y -= bullet.speed * timeScale
      }
      
      // Add trail points every 4ms
      if (!bullet.trailLength) bullet.trailLength = []
      if (!bullet.lastTrailTime) bullet.lastTrailTime = now
      
      if (now - bullet.lastTrailTime > 4) {
        if (!bullet.trailLength) bullet.trailLength = []
        bullet.trailLength.push({ x: bullet.x, y: bullet.y, age: 0 })
        if (bullet.trailLength.length > 15) {
          bullet.trailLength.shift()
        }
        bullet.lastTrailTime = now
      }
      
      return (
        bullet.y > -20 &&
        bullet.y < canvas.height + 20 &&
        bullet.x > -20 &&
        bullet.x < canvas.width + 20
      )
    })

    if (state.bullets.length > MAX_BULLETS) {
      state.bullets = state.bullets.slice(0, MAX_BULLETS)
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

    state.bullets.push({
      ...baseBullet,
      x: state.player.x + state.player.width / 2,
      color: getWeaponColor(state.currentWeapon),
      trailLength: [],
      lastTrailTime: Date.now(),
    })

    state.shotsFired++
  }

  const createExplosion = (state, x, y, size = 'small', enemyType = 'normal') => {
    let particleCount = size === 'small' ? 6 : size === 'medium' ? 12 : 20
    let colors = ['#ffaa00', '#ff6600']
    let velocity = size === 'small' ? 3 : size === 'medium' ? 5 : 7
    
    // Adjust particles and colors based on enemy type
    if (enemyType === 'fast') {
      colors = ['#ff00ff', '#ff66ff', '#aa00ff']
      particleCount = Math.ceil(particleCount * 0.8) // Fewer particles for fast
    } else if (enemyType === 'tank') {
      colors = ['#ff9900', '#ffcc66', '#ff6600']
      particleCount = Math.ceil(particleCount * 1.3) // More particles for tank
      velocity *= 1.1
    } else if (enemyType === 'shield') {
      colors = ['#00ffff', '#66ffff', '#00aa99']
      particleCount = Math.ceil(particleCount * 1.2)
    } else if (enemyType === 'silver' || size === 'large') {
      colors = ['#ffffff', '#e0e0e0', '#ffff99']
    }
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5
      const vel = velocity + (Math.random() - 0.5) * 2
      const color = colors[Math.floor(Math.random() * colors.length)]
      state.particles.push({
        x,
        y,
        vx: Math.cos(angle) * vel,
        vy: Math.sin(angle) * vel,
        life: 60,
        maxLife: 60,
        color: color,
        size: size === 'small' ? 2 : size === 'medium' ? 3 : 4,
      })
    }
    state.shakeIntensity = Math.min(5, state.shakeIntensity + (size === 'small' ? 0.5 : size === 'medium' ? 1.5 : 2))
  }

  const addScreenShake = (state, intensity) => {
    state.shakeIntensity = Math.min(8, state.shakeIntensity + intensity)
  }

  const updatePlayer = (state) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const speed = 7
    const timeScale = Math.min(state.deltaTime / 16.67, 2)

    if (state.keys['a'] || state.keys['A'] || state.keys['ArrowLeft'])
      state.player.x = Math.max(20, state.player.x - speed * timeScale)
    if (state.keys['d'] || state.keys['D'] || state.keys['ArrowRight'])
      state.player.x = Math.min(canvas.width - state.player.width - 20, state.player.x + speed * timeScale)
    if (state.keys['w'] || state.keys['W'] || state.keys['ArrowUp'])
      state.player.y = Math.max(50, state.player.y - speed * timeScale)
    if (state.keys['s'] || state.keys['S'] || state.keys['ArrowDown'])
      state.player.y = Math.min(canvas.height - state.player.height - 20, state.player.y + speed * timeScale)

    const now = Date.now()
    const fireRate = state.rapidFire ? 100 : 200
    if ((state.keys[' '] || state.keys['Spacebar']) && now - state.lastBulletShot > fireRate) {
      shootBullet(state)
      state.lastBulletShot = now
    }
  }

  const drawBoss = (ctx, state) => {
    if (!state.boss) return
    
    const boss = state.boss
    const healthPercent = boss.health / boss.maxHealth
    
    ctx.save()
    
    // Boss glow
    ctx.shadowBlur = 20
    ctx.shadowColor = 'rgba(255, 0, 255, 0.8)'
    
    // Main boss body
    const gradient = ctx.createLinearGradient(boss.x, boss.y, boss.x, boss.y + boss.height)
    gradient.addColorStop(0, '#ff00ff')
    gradient.addColorStop(0.5, '#cc00ff')
    gradient.addColorStop(1, '#8800cc')
    ctx.fillStyle = gradient
    ctx.strokeStyle = '#ff00ff'
    ctx.lineWidth = 3
    
    // Draw boss shape based on type
    if (boss.type === 'type1') {
      // Star/spiky boss
      ctx.beginPath()
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8 - Math.PI / 2
        const r = i % 2 === 0 ? 40 : 25
        const x = boss.x + boss.width / 2 + Math.cos(angle) * r
        const y = boss.y + boss.height / 2 + Math.sin(angle) * r
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
    } else if (boss.type === 'type2') {
      // Diamond boss
      ctx.beginPath()
      ctx.moveTo(boss.x + boss.width / 2, boss.y)
      ctx.lineTo(boss.x + boss.width, boss.y + boss.height / 2)
      ctx.lineTo(boss.x + boss.width / 2, boss.y + boss.height)
      ctx.lineTo(boss.x, boss.y + boss.height / 2)
      ctx.closePath()
    } else {
      // Sphere boss
      ctx.beginPath()
      ctx.arc(boss.x + boss.width / 2, boss.y + boss.height / 2, boss.width / 2 - 5, 0, Math.PI * 2)
    }
    
    ctx.fill()
    ctx.stroke()
    
    // Health bar
    ctx.shadowBlur = 0
    ctx.fillStyle = 'rgba(50, 50, 50, 0.8)'
    ctx.fillRect(boss.x, boss.y - 15, boss.width, 8)
    ctx.fillStyle = healthPercent > 0.3 ? '#00ff00' : '#ff6600'
    ctx.fillRect(boss.x, boss.y - 15, boss.width * healthPercent, 8)
    ctx.strokeStyle = '#ffff00'
    ctx.lineWidth = 1
    ctx.strokeRect(boss.x, boss.y - 15, boss.width, 8)
    
    // Boss health text
    ctx.fillStyle = '#ffff00'
    ctx.font = 'bold 12px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(`BOSS HP: ${Math.ceil(boss.health)}/${boss.maxHealth}`, boss.x + boss.width / 2, boss.y - 20)
    
    // Energy cores
    ctx.fillStyle = '#ffff00'
    for (let i = 0; i < 3; i++) {
      const offset = (i - 1) * 25
      const glow = Math.sin(Date.now() / 200 + i) * 3 + 5
      ctx.globalAlpha = 0.6 + Math.sin(Date.now() / 200 + i) * 0.4
      ctx.beginPath()
      ctx.arc(boss.x + boss.width / 2 + offset, boss.y + boss.height / 2, glow, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
    
    ctx.restore()
  }

  const gameLoop = (state) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const now = Date.now()
    state.deltaTime = now - state.lastFrameTime
    state.lastFrameTime = now

    // Calculate FPS
    state.frameCount++
    if (now - state.lastFpsUpdate >= 1000) {
      state.fps = state.frameCount
      state.frameCount = 0
      state.lastFpsUpdate = now
    }

    // Ensure music keeps playing
    if (!state.lastMusicCheck) state.lastMusicCheck = now
    if (now - state.lastMusicCheck > 2000) {
      ensureMusicPlaying()
      state.lastMusicCheck = now
    }

    // Apply screen shake effect
    let shakeX = 0
    let shakeY = 0
    if (state.shakeIntensity > 0) {
      shakeX = (Math.random() - 0.5) * state.shakeIntensity * 2
      shakeY = (Math.random() - 0.5) * state.shakeIntensity * 2
    }

    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Initialize starfield if not yet initialized
    if (!state.stars || state.stars.length === 0) {
      state.stars = initStarfield(canvas)
    }
    
    // Draw animated starfield
    drawStarfield(ctx, canvas, state.stars)
    
    ctx.save()
    ctx.translate(shakeX, shakeY)

    if (!pausedRef.current) {
      updatePlayer(state)
      updateBullets(state)
      updateEnemyBullets(state)
      spawnBoss(state)
      spawnEnemies(state)
      spawnCollectibles(state)
      spawnAsteroids(state)
      updateAsteroids(state)
      updateEnemies(state)
      updateParticles(state)
      checkCollisions(state)
    }

    drawAsteroids(ctx, state)
    drawPlayer(ctx, state)
    drawEnemies(ctx, state)
    drawBoss(ctx, state)
    drawBullets(ctx, state)
    drawParticles(ctx, state)
    drawCollectibles(ctx, state)

    // Draw enemy bullets
    ctx.fillStyle = '#ff6666'
    state.enemyBullets.forEach((b) => {
      ctx.fillRect(b.x, b.y, b.width || 3, b.height || 8)
    })

    ctx.restore()
    drawUI(ctx, state)

    // Wave announcement
    const waveDuration = 3000
    if (state.showWaveAnnouncement && Date.now() - state.waveStartTime < waveDuration) {
      const elapsed = Date.now() - state.waveStartTime
      const alpha = Math.min(1, elapsed / 500) * Math.min(1, (waveDuration - elapsed) / 500)
      const pulse = Math.sin(elapsed / 200) * 0.3 + 0.7
      
      ctx.globalAlpha = alpha
      
      // Background glow
      ctx.fillStyle = `rgba(255, 255, 0, ${alpha * 0.3})`
      ctx.beginPath()
      ctx.arc(canvas.width / 2, canvas.height / 2, 100 * pulse, 0, Math.PI * 2)
      ctx.fill()
      
      // Main wave text
      ctx.fillStyle = '#ffff00'
      ctx.shadowColor = '#ff6600'
      ctx.shadowBlur = 20
      ctx.font = 'bold 48px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(`WAVE ${state.wave}`, canvas.width / 2, canvas.height / 2)
      
      // Difficulty info below
      ctx.font = 'bold 20px Arial'
      ctx.shadowBlur = 10
      ctx.fillStyle = '#ff9999'
      const difficultyText = state.wave <= 3 ? 'EASY' : state.wave <= 6 ? 'MEDIUM' : state.wave <= 10 ? 'HARD' : 'BRUTAL'
      ctx.fillText(difficultyText, canvas.width / 2, canvas.height / 2 + 50)
      
      ctx.shadowBlur = 0
      ctx.globalAlpha = 1
    }

    requestAnimationFrame(() => gameLoop(state))
  }

  // Button handler functions (must be outside useEffect to be accessible to JSX)
  const togglePause = () => {
    setPaused((prev) => {
      const next = !prev
      pausedRef.current = next
      return next
    })
  }

  const saveGameState = async () => {
    const state = gameStateRef.current
    const saveData = {
      score: score,
      wave: wave,
      level: level,
      lives: state.player.lives,
      playerX: state.player.x,
      playerY: state.player.y,
      timestamp: Date.now()
    }
    // Visual feedback
    if (navigator && navigator.vibrate) navigator.vibrate([50, 30, 50])
    console.log('💾 Saving game...', saveData)
    
    // Save to both Firebase and localStorage as fallback
    await saveSaveSlot('current', saveData)
    localStorage.setItem('kaden-adelynn-save', JSON.stringify(saveData))
    setToast('💾 Game Saved to Cloud!')
    setTimeout(() => setToast(''), 3000)
    console.log('✅ Game saved successfully!')
  }

  const loadGameState = async () => {
    const state = gameStateRef.current
    try {
      // Visual feedback
      if (navigator && navigator.vibrate) navigator.vibrate([30, 20, 30])
      console.log('📁 Loading game...')
      
      // Try Firebase first
      const saveData = await loadSaveSlot('current')
      if (saveData) {
        setScore(saveData.score)
        setWave(saveData.wave)
        setLevel(saveData.level)
        state.player.lives = saveData.lives
        state.player.x = saveData.playerX
        state.player.y = saveData.playerY
        setToast('📁 Game Loaded from Cloud!')
        setTimeout(() => setToast(''), 3000)
        console.log('✅ Game loaded successfully!', saveData)
      } else {
        setToast('❌ No saved game found')
        setTimeout(() => setToast(''), 3000)
        console.log('⚠️ No saved game found')
      }
    } catch (e) {
      setToast('❌ Failed to load game')
      setTimeout(() => setToast(''), 3000)
      console.error('❌ Failed to load game:', e)
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Set canvas size to match container size (responsive)
    const resizeCanvas = () => {
      // Use container dimensions to properly fit mobile screens
      const container = canvas.parentElement
      if (container) {
        canvas.width = container.clientWidth
        canvas.height = container.clientHeight
      } else {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }
    }

    // Initial size
    resizeCanvas()

    // Center player ship after canvas is sized
    const state = gameStateRef.current
    state.player.x = canvas.width / 2 - state.player.width / 2
    state.player.y = canvas.height - 100

    // Update on window resize
    window.addEventListener('resize', resizeCanvas)

    // Unlock SFX on first user interaction (mobile autoplay policies)
    const unlock = () => ensureSfxUnlocked()
    const unlockEvents = ['pointerdown', 'touchstart', 'mousedown', 'keydown']
    unlockEvents.forEach((evt) => window.addEventListener(evt, unlock, { once: true, passive: true }))

    playGameplayMusic()
    state.wave = wave
    state.level = level

    // Update canvas reference in state for collision checks
    state.canvasWidth = canvas.width
    state.canvasHeight = canvas.height

    const isMobileDevice = typeof window !== 'undefined' && (window.matchMedia('(pointer: coarse)').matches || window.innerWidth <= 900)

    const handleKeyDown = (e) => {
      state.keys[e.key] = true
      
      // Pause game with P or Escape
      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        togglePause()
      }
      
      // Save game with S
      if (e.key === 's' || e.key === 'S') {
        saveGameState()
      }
      
      // Load game with L
      if (e.key === 'l' || e.key === 'L') {
        loadGameState()
      }
    }
    const handleKeyUp = (e) => {
      state.keys[e.key] = false
    }

    // Touch controls for mobile with continuous movement
    const handleTouchStart = (e) => {
      e.preventDefault()
      if (!e.touches) return
      const touch = e.touches[0]
      const canvas = canvasRef.current
      if (!canvas) return
      
      // Start music on first touch (user gesture required for autoplay)
      if (!state.musicStarted) {
        playGameplayMusic()
        state.musicStarted = true
        // Also ensure it's playing after a brief delay
        setTimeout(() => {
          ensureMusicPlaying()
        }, 100)
      } else {
        // Ensure music stays playing on subsequent touches
        ensureMusicPlaying()
      }
      
      const rect = canvas.getBoundingClientRect()
      const touchX = touch.clientX - rect.left
      const touchY = touch.clientY - rect.top
      
      // Direct position mapping: touch position maps to player position (full 2D control)
      const playerX = (touchX / rect.width) * canvas.width
      const playerY = (touchY / rect.height) * canvas.height
      // Keep player within screen bounds - match keyboard controls
      state.player.x = Math.max(20, Math.min(canvas.width - state.player.width - 20, playerX))
      state.player.y = Math.max(50, Math.min(canvas.height - state.player.height - 20, playerY))
      
      // Enable rapid fire on touch
      state.keys[' '] = true
    }

    const handleTouchMove = (e) => {
      e.preventDefault()
      if (!e.touches) return
      const touch = e.touches[0]
      const canvas = canvasRef.current
      if (!canvas) return
      
      const rect = canvas.getBoundingClientRect()
      const touchX = touch.clientX - rect.left
      const touchY = touch.clientY - rect.top
      
      // Continuous movement - directly follow touch position with smooth mapping (full 2D)
      const playerX = (touchX / rect.width) * canvas.width
      const playerY = (touchY / rect.height) * canvas.height
      // Keep player within screen bounds - match keyboard controls
      state.player.x = Math.max(20, Math.min(canvas.width - state.player.width - 20, playerX))
      state.player.y = Math.max(50, Math.min(canvas.height - state.player.height - 20, playerY))
      
      // Keep firing while moving
      state.keys[' '] = true
    }

    const handleTouchEnd = () => {
      state.keys['a'] = false
      state.keys['d'] = false
      state.keys[' '] = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
    canvas.addEventListener('touchend', handleTouchEnd)

    gameLoop(state)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      unlockEvents.forEach((evt) => window.removeEventListener(evt, unlock))
      canvas.removeEventListener('touchstart', handleTouchStart)
      canvas.removeEventListener('touchmove', handleTouchMove)
      canvas.removeEventListener('touchend', handleTouchEnd)
      window.removeEventListener('resize', resizeCanvas)
      timeoutRefs.current.forEach(clearTimeout)
    }
  }, [])

  useEffect(() => {
    healthRef.current = health
  }, [health])

  useEffect(() => {
    livesRef.current = lives
  }, [lives])

  useEffect(() => {
    const state = gameStateRef.current
    state.wave = wave
    state.level = level
  }, [wave, level])

  return (
    <div className='game-container' style={{ width: '100vw', height: '100vh', display: 'flex', overflow: 'hidden', margin: 0, padding: 0 }}>
      <canvas ref={canvasRef} style={{ display: 'block', flex: 1 }} />
      {paused && (
        <div className='pause-overlay'>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>PAUSED</div>
          <div style={{ fontSize: '18px' }}>Press P or ESC to Resume</div>
        </div>
      )}
      
      {/* Compact Mobile FAB Menu */}
      <div style={{ position: 'absolute', bottom: '80px', left: '10px', zIndex: 1000, display: (typeof window !== 'undefined' && window.innerWidth <= 900) ? 'block' : 'none' }}>
        {/* Floating Action Button */}
        <button
          onClick={() => {
            const panel = document.getElementById('fab-panel')
            if (panel) panel.style.display = panel.style.display === 'none' ? 'block' : 'none'
            // Auto-hide after 4 seconds idle
            if (panel && panel.style.display === 'block') {
              clearTimeout(window.__fabHideTimer)
              window.__fabHideTimer = setTimeout(() => {
                const p = document.getElementById('fab-panel')
                if (p) p.style.display = 'none'
              }, 4000)
            }
            // Haptic feedback
            if (navigator && navigator.vibrate) {
              navigator.vibrate(10)
            }
          }}
          aria-label='Menu'
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '24px',
            background: 'rgba(0,0,0,0.7)',
            color: '#fff',
            border: '1px solid #fff',
            fontSize: '22px',
            lineHeight: '48px',
            textAlign: 'center',
            cursor: 'pointer',
            touchAction: 'manipulation'
          }}
        >
          ☰
        </button>
        {/* Hidden Panel with Actions */}
        <div id='fab-panel' style={{
          display: 'none',
          marginTop: '8px',
          background: 'rgba(0,0,0,0.75)',
          border: '1px solid #fff',
          borderRadius: '8px',
          padding: '8px',
          minWidth: '140px'
        }}>
          <button
            onClick={() => {
              togglePause()
            }}
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '6px',
              background: paused ? 'rgba(0,180,80,0.9)' : 'rgba(255,200,0,0.9)',
              color: '#000',
              border: '1px solid #fff',
              borderRadius: '6px'
            }}
            onMouseDown={() => { if (navigator && navigator.vibrate) navigator.vibrate(7) }}
            onTouchStart={() => { if (navigator && navigator.vibrate) navigator.vibrate(7) }}
          >{paused ? '▶ Resume' : '⏸ Pause'}</button>
          <button
            onClick={async () => {
              try {
                await saveGameState()
                const panel = document.getElementById('fab-panel')
                if (panel) panel.style.display = 'none'
              } catch (e) {
                console.error('Save failed:', e)
                setToast('❌ Save failed!')
                setTimeout(() => setToast(''), 2000)
              }
            }}
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '6px',
              background: 'rgba(0, 200, 100, 0.9)',
              color: '#fff',
              border: '1px solid #fff',
              borderRadius: '6px'
            }}
            onMouseDown={() => { if (navigator && navigator.vibrate) navigator.vibrate(7) }}
            onTouchStart={() => { if (navigator && navigator.vibrate) navigator.vibrate(7) }}
          >💾 Save</button>
          <button
            onClick={async () => {
              try {
                await loadGameState()
                const panel = document.getElementById('fab-panel')
                if (panel) panel.style.display = 'none'
              } catch (e) {
                console.error('Load failed:', e)
                setToast('❌ Load failed!')
                setTimeout(() => setToast(''), 2000)
              }
            }}
            style={{
              width: '100%',
              padding: '10px',
              background: 'rgba(100, 150, 255, 0.9)',
              color: '#fff',
              border: '1px solid #fff',
              borderRadius: '6px'
            }}
            onMouseDown={() => { if (navigator && navigator.vibrate) navigator.vibrate(7) }}
            onTouchStart={() => { if (navigator && navigator.vibrate) navigator.vibrate(7) }}
          >📁 Load</button>
          <button
            onClick={() => {
              // End game now
              livesRef.current = 0
              setLives(0)
              healthRef.current = 0
              setHealth(0)
              gameOverRef.current = true
              if (onGameOver) {
                onGameOver(scoreRef.current || score, wave, level, enemiesKilled, combo)
              }
              const panel = document.getElementById('fab-panel'); if (panel) panel.style.display = 'none'
            }}
            style={{
              width: '100%',
              padding: '10px',
              marginTop: '6px',
              background: 'rgba(255, 80, 80, 0.95)',
              color: '#fff',
              border: '1px solid #fff',
              borderRadius: '6px'
            }}
            onMouseDown={() => { if (navigator && navigator.vibrate) navigator.vibrate(7) }}
            onTouchStart={() => { if (navigator && navigator.vibrate) navigator.vibrate(7) }}
          >🛑 End Game</button>
        </div>
      </div>
      
      <div className='controls-hint' style={{
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        background: 'rgba(0,0,0,0.7)',
        color: '#fff',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        fontFamily: 'monospace'
      }}>
        <div><strong>Controls:</strong></div>
        <div>P/ESC - Pause</div>
        <div>S - Save Game</div>
        <div>L - Load Game</div>
      </div>
      
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%)',
          color: '#fff',
          padding: '20px 35px',
          borderRadius: '16px',
          fontSize: '20px',
          fontWeight: '700',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.6), 0 0 0 3px rgba(255, 255, 255, 0.3)',
          zIndex: 999999,
          animation: 'toastPulse 0.4s ease-out',
          border: '3px solid rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(10px)',
          textAlign: 'center',
          minWidth: '250px',
          letterSpacing: '0.5px'
        }}>
          {toast}
        </div>
      )}
    </div>
  )
}

export default Game
