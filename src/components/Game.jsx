import React, { useRef, useEffect, useState } from 'react'
import { playSound, ensureSfxUnlocked } from '../utils/sounds'
import { playGameplayMusic, ensureMusicPlaying } from '../utils/music'
import { saveSaveSlot, loadSaveSlot } from '../utils/firebaseData'
import { getUpgradeEffects } from '../utils/upgrades'
import { storyModeManager, MissionObjectiveType } from '../utils/storyModeModels'
import './Game.css'

function Game({ selectedCharacter, selectedShip, difficulty, onGameOver, onReturnToMenu, mission, runMode }) {
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
    const baseLives = difficulty === 'easy' ? 25 : difficulty === 'medium' ? 15 : 10
    const upgradeEffects = getUpgradeEffects()
    return baseLives + upgradeEffects.extraLives
  }

  const canvasRef = useRef()
  const pausedRef = useRef(false)
  const gameOverRef = useRef(false)
  const enemyImagesRef = useRef({})
  const playerShipImageRef = useRef(null)
  
  // Load mission data from localStorage if in story mode
  const currentMission = mission || (() => {
    try {
      const missionData = localStorage.getItem('currentStoryMission')
      return missionData ? JSON.parse(missionData) : null
    } catch {
      return null
    }
  })()
  const isStoryMode = runMode === 'storyMode' || localStorage.getItem('runMode') === 'storyMode'
  
  // Mission objectives tracking
  const missionObjectivesRef = useRef(
    currentMission && currentMission.objectives
      ? currentMission.objectives.map(obj => ({ ...obj, progress: 0, isCompleted: false }))
      : []
  )
  
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
    missionStartTime: Date.now(),
    missionNoDamageStartTime: null,
    missionNoDamageDuration: 0,
    bossDefeated: false,
    missionCompleted: false,
  })

  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [killStreak, setKillStreak] = useState(0)
  const [enemiesKilled, setEnemiesKilled] = useState(0)
  const [paused, setPaused] = useState(false)
  const [health, setHealth] = useState(() => {
    const upgradeEffects = getUpgradeEffects()
    return Math.floor(100 * upgradeEffects.maxHealthMultiplier)
  })
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

  // Map ship IDs to Spaceship image numbers
  const getShipImageNumber = (shipId) => {
    const shipMap = {
      'kaden': 0,
      'adelynn': 1,
      'orion': 2,
      'lyra': 3,
      'jax': 4,
      'vega': 5,
      'kael': 6,
      'nova': 7,
      'rio': 8,
      'mira': 9,
      'falcon': 0,
      'comet': 1,
      'phantom': 2,
      'meteor': 3,
      'viper': 4,
      'shadow': 5,
      'raptor': 6,
      'titan': 7,
      'aurora': 8
    }
    return shipMap[shipId] || 0
  }

  // Load player ship image
  useEffect(() => {
    const loadPlayerShipImage = () => {
      const shipImageNum = getShipImageNumber(selectedShip)
      const img = new Image()
      img.src = `/ships/Spaceship_${shipImageNum}.png`
      img.onload = () => {
        playerShipImageRef.current = img
      }
      img.onerror = () => {
        console.warn(`Failed to load player ship image: Spaceship_${shipImageNum}.png`)
        playerShipImageRef.current = null
      }
    }
    
    loadPlayerShipImage()
  }, [selectedShip])

  // Load enemy ship images
  useEffect(() => {
    const loadEnemyImages = () => {
      const enemyTypes = ['normal', 'fast', 'tank', 'shield']
      const imageMap = {}
      
      // Map enemy types to enemy ship images
      const typeToImageMap = {
        normal: [1, 2, 3, 4],      // Use enemy_ship_1-4 for normal enemies
        fast: [5, 6],              // Use enemy_ship_5-6 for fast enemies
        tank: [7, 8],              // Use enemy_ship_7-8 for tank enemies
        shield: [9, 10]            // Use enemy_ship_9-10 for shield enemies
      }
      
      enemyTypes.forEach(type => {
        const imageNumbers = typeToImageMap[type] || [1]
        imageMap[type] = imageNumbers.map((num, idx) => {
          const img = new Image()
          img.src = `/enemies/enemy_ship_${num}.png`
          img.onload = () => {
            console.log(`Loaded enemy image: enemy_ship_${num}.png for type: ${type}`)
          }
          img.onerror = () => {
            console.warn(`Failed to load enemy image: enemy_ship_${num}.png for type: ${type}`)
          }
          return img
        })
      })
      
      enemyImagesRef.current = imageMap
      console.log('Enemy images loaded:', imageMap)
    }
    
    loadEnemyImages()
  }, [])

  // Helper function to get enemy ship image based on type
  const getEnemyShipImage = (enemy) => {
    const images = enemyImagesRef.current[enemy.type] || enemyImagesRef.current['normal']
    if (!images || images.length === 0) return null
    
    // Use enemy ID to consistently select an image for variety
    // Convert ID to number and use modulo to cycle through available images
    let idNum = 0
    if (typeof enemy.id === 'number') {
      idNum = enemy.id
    } else if (typeof enemy.id === 'string') {
      // Extract numbers from string ID
      const match = enemy.id.match(/\d+/g)
      idNum = match ? parseInt(match.join('')) : 0
    } else {
      // Fallback: use position and spawn time for uniqueness
      idNum = Math.floor((enemy.x * 1000) + (enemy.y * 100) + (state.enemiesSpawned || 0))
    }
    
    // Use modulo to cycle through available images, ensuring variety
    const index = Math.abs(idNum) % images.length
    const selectedImage = images[index]
    
    // Wait for image to load if not ready
    if (selectedImage && selectedImage.complete && selectedImage.naturalWidth > 0 && selectedImage.naturalHeight > 0) {
      return selectedImage
    }
    
    // Try to find any loaded image from the array
    for (const img of images) {
      if (img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
        return img
      }
    }
    
    // Return first image as fallback (even if not loaded)
    return images[0]
  }

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
    
    if (state.invulnerable) {
      ctx.globalAlpha = 0.6 + Math.sin(Date.now() / 200) * 0.2
    }

    // Try to use actual player ship image
    const playerImage = playerShipImageRef.current
    
    if (playerImage && playerImage.complete && playerImage.naturalWidth > 0) {
      // Draw actual player ship image
      ctx.shadowBlur = 15
      ctx.shadowColor = '#00ffff'
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      
      ctx.drawImage(
        playerImage,
        state.player.x,
        state.player.y,
        state.player.width,
        state.player.height
      )
    } else {
      // Fallback to shape drawing if image not loaded
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
    }

    ctx.restore()
  }

  const drawEnemies = (ctx, state) => {
    state.enemies.forEach((enemy) => {
      ctx.save()
      
      // Determine size based on enemy type
      let size = 30
      if (enemy.type === 'fast') {
        size = 25
      } else if (enemy.type === 'tank') {
        size = 35
      } else if (enemy.type === 'shield') {
        size = 32
      }
      
      // Try to use actual enemy ship image
      const enemyImage = getEnemyShipImage(enemy)
      
      if (enemyImage && enemyImage.complete && enemyImage.naturalWidth > 0 && enemyImage.naturalHeight > 0) {
        // Draw actual enemy ship image
        ctx.shadowBlur = 8
        ctx.shadowColor = enemy.type === 'fast' ? '#ff00ff' : 
                         enemy.type === 'tank' ? '#ff9900' : 
                         enemy.type === 'shield' ? '#00ffff' : '#ff6666'
        
        ctx.drawImage(enemyImage, enemy.x, enemy.y, size, size)
        
        // Draw shield aura for shielded enemies
        if (enemy.type === 'shield') {
          ctx.strokeStyle = `rgba(0, 255, 255, 0.5)`
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(enemy.x + size / 2, enemy.y + size / 2, size / 2 + 6, 0, Math.PI * 2)
          ctx.stroke()
        }
      } else {
        // Fallback to shape drawing if image not loaded
        let shadowColor = '#ff6666'
        let primaryColor = '#ff3333'
        let accentColor = '#ff9999'
        let borderColor = '#ff6666'
        let shape = 'triangle'
        
        if (enemy.type === 'fast') {
          primaryColor = '#ff00ff'
          shadowColor = '#ff00ff'
          accentColor = '#ffaaff'
          borderColor = '#ff00ff'
          shape = 'diamond'
        } else if (enemy.type === 'tank') {
          primaryColor = '#ff9900'
          shadowColor = '#ff9900'
          accentColor = '#ffcc66'
          borderColor = '#ff9900'
          shape = 'triangle'
        } else if (enemy.type === 'shield') {
          primaryColor = '#00ffff'
          shadowColor = '#00ffff'
          accentColor = '#66ffff'
          borderColor = '#00ffff'
          shape = 'circle'
        } else if (enemy.isSilver) {
          primaryColor = '#e8e8e8'
          shadowColor = '#e0e0e0'
          accentColor = '#ffffff'
          borderColor = '#c0c0c0'
          shape = 'triangle'
        }
        
        ctx.shadowBlur = 12
        ctx.shadowColor = shadowColor
        
        const grad = ctx.createLinearGradient(enemy.x, enemy.y, enemy.x + size, enemy.y + size)
        grad.addColorStop(0, primaryColor)
        grad.addColorStop(1, accentColor)
        ctx.fillStyle = grad
        ctx.strokeStyle = borderColor
        ctx.lineWidth = 2.5
        
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
        
        if (enemy.type === 'shield') {
          ctx.strokeStyle = `rgba(0, 255, 255, 0.5)`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.arc(enemy.x + size / 2, enemy.y + size / 2, size / 2 + 8, 0, Math.PI * 2)
          ctx.stroke()
        }
      }

      // Draw health bars for multi-health enemies
      const healthPercent = Math.min(1, enemy.health / (enemy.type === 'tank' ? 3 : enemy.type === 'shield' ? 2 : 1))
      if (enemy.health > 1) {
        ctx.fillStyle = enemy.type === 'tank' ? '#ff9900' : enemy.type === 'shield' ? '#00ffff' : '#ff3333'
        ctx.strokeStyle = enemy.type === 'tank' ? '#ff9900' : enemy.type === 'shield' ? '#00ffff' : '#ff6666'
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

    // Enhanced scoreboard with better visual hierarchy
    const currentScore = state.currentScore || score
    
    // Row 1: Score, Lives, HP, Coins
    const scorePulse = 0.95 + 0.05 * Math.sin(Date.now() / 800)
    ctx.globalAlpha = scorePulse
    placeItem('⭐ SCORE', currentScore.toLocaleString(), '#ffd700')
    ctx.globalAlpha = 1
    
    placeItem('❤ LIVES', livesRef.current, '#ff6b6b')
    
    const healthValue = Math.round(Math.max(0, Math.min(100, healthRef.current)))
    const healthColor = healthValue <= 25 ? '#ff3333' : healthValue <= 50 ? '#ff9900' : '#00ff00'
    placeItem('♥ HP', healthValue + '%', healthColor)

    placeItem('⭐ COINS', state.coins.toLocaleString(), '#ffd700')

    // Row 2: Kills, Wave, Combo, Accuracy
    placeItem('🎯 KILLS', (state.currentKills || 0).toLocaleString(), '#00ffff')
    
    // Wave with pulsing effect
    const wavePulse = 0.9 + 0.1 * Math.sin(Date.now() / 500)
    ctx.globalAlpha = wavePulse
    placeItem('🌊 WAVE', state.wave, '#ff00ff')
    ctx.globalAlpha = 1
    
    // Enhanced combo display with multiplier - shows actual multiplier
    if (combo > 0) {
      const actualMultiplier = state.comboMultiplier || 1.0
      const pulse = 0.8 + 0.2 * Math.sin(Date.now() / 80)
      const comboColor = combo >= 30 ? '#ff00ff' : combo >= 20 ? '#ff00aa' : combo >= 10 ? '#ffd700' : combo >= 5 ? '#ffff00' : '#ffaa00'
      ctx.globalAlpha = pulse
      ctx.shadowBlur = combo >= 10 ? 12 : 8
      ctx.shadowColor = comboColor
      placeItem('⚡ COMBO', `${combo}x (${actualMultiplier.toFixed(1)}x)`, comboColor)
      ctx.shadowBlur = 0
      ctx.globalAlpha = 1
    } else {
      placeItem('⚡ COMBO', '0x', '#666666')
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
    
    // Mission Objectives (Story Mode)
    if (isStoryMode && missionObjectivesRef.current && missionObjectivesRef.current.length > 0) {
      ctx.font = `bold ${fontSize - 1}px "Courier New"`
      const objY = topMargin + barH + 10
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)'
      ctx.fillRect(10, objY, cw - 20, missionObjectivesRef.current.length * (lineHeight - 2) + 10)
      ctx.strokeStyle = '#4ecdc4'
      ctx.lineWidth = 1
      ctx.strokeRect(10, objY, cw - 20, missionObjectivesRef.current.length * (lineHeight - 2) + 10)
      
      missionObjectivesRef.current.forEach((obj, idx) => {
        const y = objY + 15 + idx * (lineHeight - 2)
        const status = obj.isCompleted ? '✓' : '○'
        const statusColor = obj.isCompleted ? '#00ff00' : '#ffff00'
        const progressText = obj.type === MissionObjectiveType.ACCURACY 
          ? `${obj.progress}%` 
          : `${obj.progress}/${obj.target}`
        
        ctx.fillStyle = statusColor
        ctx.fillText(`${status} ${obj.description}: ${progressText}`, 20, y)
      })
    }
  }

  const spawnBoss = (state) => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Spawn boss on every 5th wave (5, 10, 15, etc.)
    const shouldSpawnBoss = state.wave > 0 && state.wave % 5 === 0 && state.enemies.length === 0 && !state.boss

    if (shouldSpawnBoss) {
      const bossTypes = ['type1', 'type2', 'type3']
      const bossType = bossTypes[Math.floor(state.wave / 5) % bossTypes.length]
      
      // More challenging bosses - exponential health scaling
      const bossBaseHealth = state.wave <= 5 ? 20 + state.wave * 3 : 35 + (state.wave - 5) * 5 + (state.wave - 5) * (state.wave - 5) * 2
      const bossHealth = Math.round(bossBaseHealth * difficultyModifier())
      
      state.boss = {
        x: canvas.width / 2 - 40,
        y: -80,
        width: 80,
        height: 80,
        health: bossHealth,
        maxHealth: bossHealth,
        speed: 1.5 + state.wave * 0.15, // Bosses move faster in later waves
        type: bossType,
        shootTimer: 0,
        shootInterval: Math.max(100, 300 - state.wave * 12), // Bosses shoot faster in later waves
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
    // More aggressive spawn rate - enemies spawn much faster in later waves
    const baseRate = state.wave <= 2 ? 2400 : state.wave <= 4 ? 1800 : state.wave <= 8 ? 1200 : Math.max(400, 1000 - (state.wave * 50))
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
        // Tank enemies - increased minimum speed so they don't look stationary
        enemyType = 'tank'
        health = 3
        speedMult = 0.9 // Increased from 0.6 to 0.9 for better visibility
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
      
      // More aggressive speed scaling: +0.2 per wave, exponential after wave 10
      const waveSpeedBonus = state.wave <= 10 
        ? 1.0 + (state.wave * 0.2)
        : 3.0 + ((state.wave - 10) * 0.3) // Exponential scaling after wave 10
      
      // Create unique ID using timestamp, spawn count, and random component
      const uniqueId = `${Date.now()}_${state.enemiesSpawned}_${Math.random().toString(36).substr(2, 9)}`
      
      const enemy = {
        id: uniqueId, // Unique string ID for each enemy
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
    // Check for NO_POWERUPS mutator
    if (currentMission && currentMission.mutator === 'noPowerups') {
      return // Don't spawn powerups in this mission
    }
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
          const upgradeEffects = getUpgradeEffects()
          // Luck boost increases power-up drop rates
          const luckMultiplier = upgradeEffects.luckBoost
          const baseCoinChance = 0.35
          const baseHealthChance = 0.08
          const baseShieldChance = 0.07
          const baseDamageChance = 0.06
          
          // Adjust probabilities with luck boost (more power-ups, fewer weapons)
          const coinChance = Math.min(0.5, baseCoinChance * luckMultiplier)
          const healthChance = Math.min(0.15, baseHealthChance * luckMultiplier)
          const shieldChance = Math.min(0.12, baseShieldChance * luckMultiplier)
          const damageChance = Math.min(0.10, baseDamageChance * luckMultiplier)
          
          const roll = Math.random()
          if (!state.powerUps) state.powerUps = []
          
          if (roll < coinChance) {
            // 35% - coins
            const upgradeEffects = getUpgradeEffects()
            // Enhanced coin rewards: base + wave bonus + combo bonus
            const baseCoins = 1
            const waveBonus = Math.floor(state.wave * 0.2) // More coins in later waves
            const comboBonus = combo >= 10 ? 2 : combo >= 5 ? 1 : 0 // Bonus for high combos
            const coinsEarned = Math.floor((baseCoins + waveBonus + comboBonus) * upgradeEffects.starMultiplier)
            state.coins += coinsEarned
            state.powerUps.push({
              x: popup.x,
              y: popup.y,
              type: 'coin',
              width: 20,
              height: 20,
              vy: -0.8,
            })
          } else if (roll < coinChance + healthChance) {
            // Health power-up
            state.powerUps.push({
              x: popup.x,
              y: popup.y,
              type: 'health',
              width: 24,
              height: 24,
              vy: -0.6,
            })
          } else if (roll < coinChance + healthChance + shieldChance) {
            // Shield power-up
            state.powerUps.push({
              x: popup.x,
              y: popup.y,
              type: 'shield',
              width: 27,
              height: 27,
              vy: -0.6,
            })
          } else if (roll < coinChance + healthChance + shieldChance + damageChance) {
            // Damage boost
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
        
        // Magnetic pull upgrade - increase collection range
        const upgradeEffects = getUpgradeEffects()
        const collectionRange = upgradeEffects.magneticPull ? 60 : 30
        
        if (distance < collectionRange) {
          // Player collected the power-up
          if (p.type === 'coin') {
            // Enhanced coin rewards: base + wave bonus + combo bonus
            const baseCoins = 1
            const waveBonus = Math.floor(state.wave * 0.2) // More coins in later waves
            const comboBonus = combo >= 10 ? 2 : combo >= 5 ? 1 : 0 // Bonus for high combos
            const coinsEarned = Math.floor((baseCoins + waveBonus + comboBonus) * upgradeEffects.starMultiplier)
            state.coins += coinsEarned
            playSound('coin', 0.3)
          } else if (p.type === 'health') {
            const upgradeEffects = getUpgradeEffects()
            const maxHealth = Math.floor(100 * upgradeEffects.maxHealthMultiplier)
            setHealth((h) => Math.min(maxHealth, h + 20))
            playSound('powerup', 0.4)
          } else if (p.type === 'shield') {
            const upgradeEffects = getUpgradeEffects()
            state.shield = true
            const baseShieldTime = 8000 // 8 seconds
            state.shieldTimer = Math.floor(baseShieldTime * upgradeEffects.shieldDurationMultiplier)
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

    // Asteroids spawn starting from wave 1, but more frequently in later waves
    if (now - state.lastAsteroidSpawn > asteroidRate && state.wave >= 1) {
      if (!state.asteroids) state.asteroids = []
      const maxAsteroids = state.wave < 3 ? 8 : state.wave < 5 ? 12 : 15
      if (state.asteroids.length < maxAsteroids) {
        const roll = Math.random()
        const asteroidSize = roll < 0.5 ? 'small' : roll < 0.85 ? 'medium' : 'large'
        
        // Speed increases with wave, minimum 2.5 to ensure visibility
        const baseSpeed = 2.5 + (state.wave * 0.2)
        const speedVariation = Math.random() * 1.5
        
        state.asteroids.push({
          x: Math.random() * canvas.width,
          y: -50, // Start further up
          size: asteroidSize,
          width: asteroidSize === 'small' ? 20 : asteroidSize === 'medium' ? 35 : 50,
          height: asteroidSize === 'small' ? 20 : asteroidSize === 'medium' ? 35 : 50,
          speed: baseSpeed + speedVariation, // Increased speed: 2.5-4.0+ (wave dependent)
          rotation: 0,
          rotationSpeed: Math.random() * 0.1 - 0.05,
          health: asteroidSize === 'small' ? 1 : asteroidSize === 'medium' ? 2 : 3,
          maxHealth: asteroidSize === 'small' ? 1 : asteroidSize === 'medium' ? 2 : 3,
          id: Date.now() + Math.random(), // Add ID for consistent rendering
        })
        state.lastAsteroidSpawn = now
      }
    }
  }

  const updateAsteroids = (state) => {
    const canvas = canvasRef.current
    if (!canvas || !state.asteroids || state.asteroids.length === 0) return

    const timeScale = Math.min(state.deltaTime / 16.67, 2)

    state.asteroids = state.asteroids.filter((ast) => {
      if (!ast) return false
      ast.y += ast.speed * timeScale
      ast.rotation += ast.rotationSpeed * timeScale
      // Remove asteroids that go off screen (bottom only, keep ones off top for spawning)
      return ast.y < canvas.height + 50 && ast.y > -100
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

  const updateComboEffects = (state) => {
    if (!state.comboEffects) return
    
    // Update combo effects and remove expired ones
    state.comboEffects = state.comboEffects.filter((effect) => {
      effect.life--
      effect.y -= 2.5 // Slightly faster float for more dynamic feel
      effect.alpha = Math.max(0, effect.life / 60) // Fade out
      if (effect.glow) {
        effect.scale = 1.5 + Math.sin(Date.now() / 100) * 0.4 // More pronounced pulsing
      }
      return effect.life > 0
    })
    
    // Reset combo if no kills - shorter window for higher combos (more challenging)
    if (combo > 0) {
      if (!state.lastComboKill) state.lastComboKill = Date.now()
      const timeSinceLastKill = Date.now() - state.lastComboKill
      // Higher combos have shorter time window (more skill required)
      const comboTimeout = combo >= 20 ? 2000 : combo >= 10 ? 2500 : 3000
      if (timeSinceLastKill > comboTimeout) {
        setCombo(0)
        state.comboMultiplier = 1.0
        state.lastComboKill = null
        // Visual feedback for combo loss
        playSound('hit', 0.2)
      }
    }
  }

  const drawComboEffects = (ctx, state) => {
    if (!state.comboEffects || state.comboEffects.length === 0) return
    
    state.comboEffects.forEach((effect) => {
      ctx.save()
      ctx.globalAlpha = effect.alpha
      
      if (effect.glow) {
        // Glow effect for milestone combos
        ctx.shadowBlur = 20
        ctx.shadowColor = effect.color || '#ffd700'
      }
      
      ctx.fillStyle = effect.color || '#ffff00'
      ctx.font = `bold ${24 * effect.scale}px Arial`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(effect.text, effect.x, effect.y)
      
      ctx.restore()
    })
  }

  // Update mission objectives
  const updateMissionObjectives = (state) => {
    if (!isStoryMode || !missionObjectivesRef.current || missionObjectivesRef.current.length === 0) return
    
    const now = Date.now()
    const missionTime = (now - state.missionStartTime) / 1000 // Time in seconds
    
    missionObjectivesRef.current.forEach((objective) => {
      if (objective.isCompleted) return
      
      switch (objective.type) {
        case MissionObjectiveType.SURVIVE:
          objective.progress = Math.floor(missionTime)
          if (objective.progress >= objective.target) {
            objective.isCompleted = true
            playSound('level-complete', 0.3)
            setToast(`✓ ${objective.description}`)
            setTimeout(() => setToast(''), 2000)
          }
          break
          
        case MissionObjectiveType.KILL_ENEMIES:
          objective.progress = state.currentKills || 0
          if (objective.progress >= objective.target) {
            objective.isCompleted = true
            playSound('level-complete', 0.3)
            setToast(`✓ ${objective.description}`)
            setTimeout(() => setToast(''), 2000)
          }
          break
          
        case MissionObjectiveType.REACH_WAVE:
          objective.progress = state.wave || 1
          if (objective.progress >= objective.target) {
            objective.isCompleted = true
            playSound('level-complete', 0.3)
            setToast(`✓ ${objective.description}`)
            setTimeout(() => setToast(''), 2000)
          }
          break
          
        case MissionObjectiveType.COLLECT_STARS:
          objective.progress = state.coins || 0
          if (objective.progress >= objective.target) {
            objective.isCompleted = true
            playSound('level-complete', 0.3)
            setToast(`✓ ${objective.description}`)
            setTimeout(() => setToast(''), 2000)
          }
          break
          
        case MissionObjectiveType.DEFEAT_BOSS:
          objective.progress = state.bossDefeated ? 1 : 0
          if (objective.progress >= objective.target) {
            objective.isCompleted = true
            playSound('level-complete', 0.3)
            setToast(`✓ ${objective.description}`)
            setTimeout(() => setToast(''), 2000)
          }
          break
          
        case MissionObjectiveType.ACCURACY:
          const accuracy = state.shotsFired > 0 ? Math.round((state.shotsHit / state.shotsFired) * 100) : 0
          objective.progress = accuracy
          if (objective.progress >= objective.target) {
            objective.isCompleted = true
            playSound('level-complete', 0.3)
            setToast(`✓ ${objective.description}`)
            setTimeout(() => setToast(''), 2000)
          }
          break
          
        case MissionObjectiveType.COMBO:
          objective.progress = combo
          if (objective.progress >= objective.target) {
            objective.isCompleted = true
            playSound('level-complete', 0.3)
            setToast(`✓ ${objective.description}`)
            setTimeout(() => setToast(''), 2000)
          }
          break
          
        case MissionObjectiveType.NO_DAMAGE:
          // Track consecutive time without taking damage
          if (healthRef.current >= Math.floor(100 * getUpgradeEffects().maxHealthMultiplier)) {
            if (!state.missionNoDamageStartTime) {
              state.missionNoDamageStartTime = now
            }
            const noDamageTime = (now - state.missionNoDamageStartTime) / 1000
            objective.progress = Math.floor(noDamageTime)
            state.missionNoDamageDuration = noDamageTime
          } else {
            state.missionNoDamageStartTime = null
            state.missionNoDamageDuration = 0
            objective.progress = 0
          }
          if (objective.progress >= objective.target) {
            objective.isCompleted = true
            playSound('level-complete', 0.3)
            setToast(`✓ ${objective.description}`)
            setTimeout(() => setToast(''), 2000)
          }
          break
      }
    })
    
    // Check if all objectives are completed
    const allCompleted = missionObjectivesRef.current.every(obj => obj.isCompleted)
    if (allCompleted && currentMission && !state.missionCompleted) {
      state.missionCompleted = true
      // Complete mission in story mode manager
      const starsEarned = state.coins || 0
      storyModeManager.completeMission(currentMission.id, starsEarned)
      playSound('level-complete', 0.5)
      setToast(`🎉 Mission Complete! +${starsEarned} stars`)
      setTimeout(() => {
        // Return to story mode after mission completion
        if (onReturnToMenu) {
          onReturnToMenu()
        }
      }, 3000)
    }
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
    if (!state.asteroids || state.asteroids.length === 0) return
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

    const upgradeEffects = getUpgradeEffects()
    // Time dilation slows down enemies
    const baseTimeScale = Math.min(state.deltaTime / 16.67, 2)
    const timeScale = upgradeEffects.timeSlow ? baseTimeScale * 0.5 : baseTimeScale
    const MAX_ENEMIES = 50

    state.enemies = state.enemies.slice(0, MAX_ENEMIES).filter((enemy) => {
      // Freeze effect - slow down frozen enemies
      if (enemy.frozen && enemy.frozen > 0) {
        enemy.frozen--
        enemy.y += enemy.speed * timeScale * 0.5 // 50% slower when frozen
      } else {
        enemy.y += enemy.speed * timeScale
      }
      
      // Poison effect - damage over time
      if (enemy.poisoned && enemy.poisoned > 0) {
        enemy.poisoned--
        if (enemy.poisoned % 30 === 0) { // Damage every 30 frames
          enemy.health = (typeof enemy.health === 'number' ? enemy.health : 1) - 1
        }
      }

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
      // More aggressive shooting - increases with wave
      const baseShootChance = 0.01 * difficultyModifier()
      const waveShootBonus = state.wave * 0.003 // Enemies shoot more frequently in later waves
      let shootChance = Math.min(0.08, baseShootChance + waveShootBonus)
      
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
          
          // Apply mission mutators
          let bulletSpeed = 3 * timeScale
          if (currentMission && currentMission.mutator === 'fastEnemyBullets') {
            bulletSpeed = 5 * timeScale // Faster enemy bullets
          }
          
          state.enemyBullets.push({
            x: enemy.x + 15,
            y: enemy.y + 30,
            vx: vx,
            vy: vy,
            speed: bulletSpeed,
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
            // Wave bonus: higher waves = more points
            const waveBonus = 1.0 + (state.wave * 0.1)
            // Risk bonus: lower health = more points (risk/reward)
            const healthPercent = healthRef.current / Math.floor(100 * getUpgradeEffects().maxHealthMultiplier)
            const riskBonus = healthPercent < 0.3 ? 1.5 : healthPercent < 0.5 ? 1.3 : 1.0
            const points = Math.floor(10 * state.scoreMultiplier * comboMult * waveBonus * riskBonus)

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
            state.lastComboKill = Date.now() // Track last combo kill time
            
            // Enhanced combo multiplier - exponential scaling for higher combos
            if (newCombo <= 10) {
              state.comboMultiplier = 1.0 + (newCombo * 0.15) // 15% per combo up to 10
            } else if (newCombo <= 20) {
              state.comboMultiplier = 2.5 + ((newCombo - 10) * 0.2) // 20% per combo from 11-20
            } else {
              state.comboMultiplier = 4.5 + ((newCombo - 20) * 0.25) // 25% per combo above 20
            }

            // Enhanced combo popup effects - more frequent and visually impressive
            if (!state.comboEffects) state.comboEffects = []
            const isMilestone = newCombo % 5 === 0 || newCombo === 10 || newCombo === 20 || newCombo === 30
            const isSuperMilestone = newCombo === 10 || newCombo === 20 || newCombo === 30 || newCombo === 50
            
            // Show combo popup for milestones or every 3 kills after combo 10
            if (isMilestone || (newCombo > 10 && newCombo % 3 === 0) || newCombo <= 5) {
              state.comboEffects.push({
                x: enemy.x + 15,
                y: enemy.y + 15,
                text: isSuperMilestone ? `🔥 COMBO x${newCombo}! 🔥` : `COMBO x${newCombo}!`,
                life: isSuperMilestone ? 90 : isMilestone ? 60 : 45,
                alpha: 1,
                scale: isSuperMilestone ? 2.0 : isMilestone ? 1.5 : 1.2,
                glow: isMilestone,
                color: isSuperMilestone ? '#ff00ff' : isMilestone ? '#ffd700' : '#ffff00',
              })
              
              // Special sound for milestones
              if (isSuperMilestone) {
                playSound('level-complete', 0.4)
                addScreenShake(state, 3)
              } else if (isMilestone) {
                playSound('powerup', 0.3)
              }
            }
            
            // Reset combo if too much time passes (handled in updateComboEffects)

            const upgradeEffects = getUpgradeEffects()
            let dmg = Math.max(1, Math.round(state.damageMul || 1))
            dmg = Math.round(dmg * upgradeEffects.damageMultiplier)
            
            // Berserker mode - damage increases with kills
            if (upgradeEffects.berserker) {
              const killBonus = Math.min(2.0, 1.0 + (state.currentKills || 0) * 0.01) // Up to 2x damage
              dmg = Math.round(dmg * killBonus)
            }
            
            // Critical hit chance
            if (upgradeEffects.critChance > 0 && Math.random() < upgradeEffects.critChance) {
              dmg = Math.round(dmg * 3)
            }
            
            enemy.health = (typeof enemy.health === 'number' ? enemy.health : 1) - dmg

            // Explosive bullets - damage nearby enemies
            if (bullet.explosive) {
              const explosionRadius = 50
              for (let k = 0; k < state.enemies.length; k++) {
                const otherEnemy = state.enemies[k]
                if (k !== j) {
                  const dx = otherEnemy.x - enemy.x
                  const dy = otherEnemy.y - enemy.y
                  const dist = Math.sqrt(dx * dx + dy * dy)
                  if (dist < explosionRadius) {
                    const explosionDmg = Math.floor(dmg * 0.5)
                    otherEnemy.health = (typeof otherEnemy.health === 'number' ? otherEnemy.health : 1) - explosionDmg
                    if (otherEnemy.health <= 0 && !enemiesToRemove.includes(k)) {
                      enemiesToRemove.push(k)
                      createExplosion(state, otherEnemy.x + 15, otherEnemy.y + 15, 'small', otherEnemy.type)
                    }
                  }
                }
              }
            }
            
            // Chain lightning - damage nearby enemies
            if (bullet.chainLightning && enemiesToRemove.includes(j)) {
              const chainRadius = 60
              let chained = 0
              for (let k = 0; k < state.enemies.length && chained < 3; k++) {
                const otherEnemy = state.enemies[k]
                if (k !== j && !enemiesToRemove.includes(k)) {
                  const dx = otherEnemy.x - enemy.x
                  const dy = otherEnemy.y - enemy.y
                  const dist = Math.sqrt(dx * dx + dy * dy)
                  if (dist < chainRadius) {
                    const chainDmg = Math.floor(dmg * 0.6)
                    otherEnemy.health = (typeof otherEnemy.health === 'number' ? otherEnemy.health : 1) - chainDmg
                    if (otherEnemy.health <= 0) {
                      enemiesToRemove.push(k)
                      createExplosion(state, otherEnemy.x + 15, otherEnemy.y + 15, 'small', otherEnemy.type)
                      chained++
                    }
                  }
                }
              }
            }
            
            // Apply freeze effect
            if (bullet.freeze) {
              enemy.frozen = 180 // 3 seconds at 60fps
            }
            
            // Apply poison effect
            if (bullet.poison) {
              enemy.poisoned = 300 // 5 seconds of poison
            }
            
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
      const newWave = waveMilestone + 1 // Start at wave 1, then 2, 3, etc.
      if (newWave !== state.wave) {
        state.wave = newWave
        setWave(newWave)
        state.showWaveAnnouncement = true
        state.waveStartTime = Date.now()
        playSound('levelUp', 0.4)
      }
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
            const upgradeEffects = getUpgradeEffects()
            let damage = getDamageAmount()
            // Apply damage reduction
            damage = Math.max(1, Math.floor(damage * (1 - upgradeEffects.damageReduction)))
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
              const maxHealth = Math.floor(100 * upgradeEffects.maxHealthMultiplier)
              return maxHealth
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

      // Asteroid-player collisions
      if (state.asteroids && state.asteroids.length > 0) {
        const asteroidsToRemove = []
        
        for (let i = 0; i < state.asteroids.length; i++) {
          const ast = state.asteroids[i]
          if (!ast) continue
          
          // Calculate asteroid center and radius
          const astCenterX = ast.x + ast.width / 2
          const astCenterY = ast.y + ast.height / 2
          const astRadius = Math.max(ast.width, ast.height) / 2
          
          // Calculate player center and radius
          const playerCenterX = state.player.x + state.player.width / 2
          const playerCenterY = state.player.y + state.player.height / 2
          const playerRadius = Math.max(state.player.width, state.player.height) / 2
          
          // Use circle-circle collision for accurate detection
          const dx = astCenterX - playerCenterX
          const dy = astCenterY - playerCenterY
          const distance = Math.sqrt(dx * dx + dy * dy)
          const minDistance = astRadius + playerRadius
          
          if (distance < minDistance) {
            // Asteroid hit player - apply damage
            if (!state.invulnerable) {
              // Check if shield is active
              if (state.shield) {
                // Shield absorbs the hit, but asteroid still destroyed
                playSound('hit', 0.2)
                addScreenShake(state, 1)
                createExplosion(state, astCenterX, astCenterY, 'small')
              } else {
                // Apply hull damage - larger asteroids do more damage
                const baseDamage = ast.size === 'large' ? 15 : ast.size === 'medium' ? 10 : 5
                setHealth((h) => {
                  const upgradeEffects = getUpgradeEffects()
                  let damage = baseDamage
                  // Apply damage reduction
                  damage = Math.max(1, Math.floor(damage * (1 - upgradeEffects.damageReduction)))
                  // Apply fragile player mutator (double damage)
                  if (currentMission && currentMission.mutator === 'fragilePlayer') {
                    damage = damage * 2
                  }
                  const newHealth = h - damage
                  
                  if (newHealth <= 0) {
                    addScreenShake(state, 4)
                    createExplosion(state, state.player.x + state.player.width / 2, state.player.y, 'large')
                    playSound('hit', 0.4)
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
                    const maxHealth = Math.floor(100 * upgradeEffects.maxHealthMultiplier)
                    return maxHealth
                  }
                  return newHealth
                })
                
                // Visual and audio feedback
                playSound('hit', 0.3)
                addScreenShake(state, 2)
                createExplosion(state, astCenterX, astCenterY, ast.size === 'large' ? 'medium' : 'small')
              }
            }
            
            // Destroy asteroid on impact
            asteroidsToRemove.push(i)
          }
        }
        
        // Remove asteroids that hit the player
        asteroidsToRemove
          .sort((a, b) => b - a)
          .forEach((index) => {
            if (state.asteroids[index]) {
              state.asteroids.splice(index, 1)
            }
          })
      }

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
            const upgradeEffects = getUpgradeEffects()
            let damage = getDamageAmount()
            // Apply damage reduction
            damage = Math.max(1, Math.floor(damage * (1 - upgradeEffects.damageReduction)))
            // Apply fragile player mutator (double damage)
            if (currentMission && currentMission.mutator === 'fragilePlayer') {
              damage = damage * 2
            }
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
              const upgradeEffects = getUpgradeEffects()
              const maxHealth = Math.floor(100 * upgradeEffects.maxHealthMultiplier)
              return maxHealth
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

          // Get bullet dimensions - handle both width/height and size properties
          const bulletWidth = bullet.width || 5
          const bulletHeight = bullet.height || 10
          
          // Calculate bullet center for more accurate collision
          const bulletCenterX = bullet.x + bulletWidth / 2
          const bulletCenterY = bullet.y + bulletHeight / 2
          const bulletRadius = Math.max(bulletWidth, bulletHeight) / 2
          
          // Calculate asteroid center and radius
          const astCenterX = ast.x + ast.width / 2
          const astCenterY = ast.y + ast.height / 2
          const astRadius = Math.max(ast.width, ast.height) / 2
          
          // Use circle-circle collision for more accurate detection
          const dx = bulletCenterX - astCenterX
          const dy = bulletCenterY - astCenterY
          const distance = Math.sqrt(dx * dx + dy * dy)
          const minDistance = bulletRadius + astRadius

          if (distance < minDistance) {
            // Hit the asteroid
            ast.health = (ast.health || 1) - 1
            playSound('hit', 0.2)
            
            if (!bullet.pierce) bulletsToRemoveAst.push(i)

            if (ast.health <= 0) {
              asteroidsToRemove.push(j)
              createExplosion(state, astCenterX, astCenterY, 'small')
              addScreenShake(state, 0.5)
              
              // Break large asteroids into medium pieces, medium into small
              if (ast.size === 'large') {
                // Spawn 2-3 medium asteroids
                const numPieces = 2 + Math.floor(Math.random() * 2)
                for (let k = 0; k < numPieces; k++) {
                  const angle = (Math.PI * 2 * k) / numPieces + Math.random() * 0.5
                  const offset = 15 + Math.random() * 10
                  state.asteroids.push({
                    id: `${Date.now()}_${k}_${Math.random()}`,
                    x: astCenterX + Math.cos(angle) * offset - 17.5,
                    y: astCenterY + Math.sin(angle) * offset - 17.5,
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
                  const angle = (Math.PI * 2 * k) / numPieces + Math.random() * 0.5
                  const offset = 10 + Math.random() * 8
                  state.asteroids.push({
                    id: `${Date.now()}_${k}_${Math.random()}`,
                    x: astCenterX + Math.cos(angle) * offset - 10,
                    y: astCenterY + Math.sin(angle) * offset - 10,
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
              
              // Award points for destroying asteroid
              const points = ast.size === 'large' ? 50 : ast.size === 'medium' ? 30 : 20
              setScore((s) => {
                const newScore = s + points
                state.currentScore = newScore
                return newScore
              })
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
            state.bossDefeated = true
            createExplosion(state, state.boss.x + state.boss.width / 2, state.boss.y + state.boss.height / 2, 'large')
            addScreenShake(state, 5)
            playSound('bossSpawn', 0.5) // Victory sound
            
            // Spawn power-ups and coins (unless NO_POWERUPS mutator)
            if (!currentMission || currentMission.mutator !== 'noPowerups') {
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
            }
            
            // Apply DOUBLE_BOSS_MINIONS mutator
            if (currentMission && currentMission.mutator === 'doubleBossMinions') {
              // Spawn extra enemies when boss is defeated
              for (let j = 0; j < 3; j++) {
                if (!state.enemies) state.enemies = []
                state.enemies.push({
                  x: state.boss.x + Math.random() * state.boss.width,
                  y: state.boss.y,
                  type: 'basic',
                  health: 1,
                  width: 30,
                  height: 30,
                  speed: 1 + Math.random(),
                })
              }
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
          let damage = getDamageAmount() * 3 // Boss deals triple damage
          // Apply fragile player mutator (double damage)
          if (currentMission && currentMission.mutator === 'fragilePlayer') {
            damage = damage * 2
          }
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
              const upgradeEffects = getUpgradeEffects()
              const maxHealth = Math.floor(100 * upgradeEffects.maxHealthMultiplier)
              return maxHealth
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
    const upgradeEffects = getUpgradeEffects()

    state.bullets = state.bullets.filter((bullet) => {
      // Homing bullets - track nearest enemy
      if (bullet.homing && state.enemies.length > 0) {
        let nearestEnemy = null
        let nearestDist = Infinity
        for (const enemy of state.enemies) {
          const dx = (enemy.x + 15) - bullet.x
          const dy = (enemy.y + 15) - bullet.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < nearestDist) {
            nearestDist = dist
            nearestEnemy = enemy
          }
        }
        if (nearestEnemy && nearestDist < 200) {
          const dx = (nearestEnemy.x + 15) - bullet.x
          const dy = (nearestEnemy.y + 15) - bullet.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist > 0) {
            bullet.vx = (dx / dist) * 10
            bullet.vy = (dy / dist) * 10
          }
        }
      }
      
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

  const shootBullet = (state, upgradeEffects) => {
    playSound('laser-shoot', 0.2)

    const baseBullet = {
      x: state.player.x,
      y: state.player.y,
      speed: 10,
      owner: 'player',
      weapon: state.currentWeapon,
      width: upgradeEffects.bulletSize ? 7 : 5,
      height: upgradeEffects.bulletSize ? 14 : 10,
      pierce: upgradeEffects.penetration,
      homing: upgradeEffects.homing,
      explosive: upgradeEffects.explosive,
      chainLightning: upgradeEffects.chainLightning,
      freeze: upgradeEffects.freezeShot,
      poison: upgradeEffects.poisonShot,
    }

    const numShots = upgradeEffects.multishot || 1
    const spreadAngle = numShots > 1 ? Math.PI / 12 : 0 // 15 degree spread per shot

    for (let i = 0; i < numShots; i++) {
      const offset = numShots > 1 ? (i - (numShots - 1) / 2) * spreadAngle : 0
      const bulletX = state.player.x + state.player.width / 2
      
      state.bullets.push({
        ...baseBullet,
        x: bulletX,
        y: state.player.y,
        vx: Math.sin(offset) * 2,
        vy: -10,
        color: getWeaponColor(state.currentWeapon),
        trailLength: [],
        lastTrailTime: Date.now(),
      })
    }

    state.shotsFired += numShots
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

    const upgradeEffects = getUpgradeEffects()
    const baseSpeed = 7
    const speed = baseSpeed * upgradeEffects.speedMultiplier
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
    const baseFireRate = state.rapidFire ? 100 : 200
    const fireRate = baseFireRate / upgradeEffects.fireRateMultiplier
    if ((state.keys[' '] || state.keys['Spacebar']) && now - state.lastBulletShot > fireRate) {
      shootBullet(state, upgradeEffects)
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
      // Apply upgrade effects
      const upgradeEffects = getUpgradeEffects()
      
      // Health regeneration
      if (upgradeEffects.healthRegen && healthRef.current < Math.floor(100 * upgradeEffects.maxHealthMultiplier)) {
        const regenRate = 0.05 // 0.05 health per frame
        setHealth((h) => {
          const maxHealth = Math.floor(100 * upgradeEffects.maxHealthMultiplier)
          return Math.min(maxHealth, h + regenRate)
        })
      }
      
      // Time dilation - slow down enemies
      if (upgradeEffects.timeSlow) {
        state.deltaTime = state.deltaTime * 0.5 // Enemies move 50% slower
      }
      
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
      updateComboEffects(state)
      updateMissionObjectives(state)
      checkCollisions(state)
    }

    drawAsteroids(ctx, state)
    drawPlayer(ctx, state)
    drawEnemies(ctx, state)
    drawBoss(ctx, state)
    drawBullets(ctx, state)
    drawParticles(ctx, state)
    drawCollectibles(ctx, state)
    drawComboEffects(ctx, state)

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
          <div style={{ fontSize: '18px', marginBottom: '30px' }}>Press P or ESC to Resume</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
            <button
              onClick={() => {
                togglePause()
              }}
              style={{
                padding: '12px 32px',
                fontSize: '20px',
                background: 'rgba(0,180,80,0.9)',
                color: '#fff',
                border: '2px solid #fff',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
              onMouseDown={() => { if (navigator && navigator.vibrate) navigator.vibrate(7) }}
              onTouchStart={() => { if (navigator && navigator.vibrate) navigator.vibrate(7) }}
            >
              ▶ Resume
            </button>
            {onReturnToMenu && (
              <button
                onClick={() => {
                  if (onReturnToMenu) {
                    onReturnToMenu()
                  }
                }}
                style={{
                  padding: '12px 32px',
                  fontSize: '20px',
                  background: 'rgba(255, 100, 100, 0.9)',
                  color: '#fff',
                  border: '2px solid #fff',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
                onMouseDown={() => { if (navigator && navigator.vibrate) navigator.vibrate(7) }}
                onTouchStart={() => { if (navigator && navigator.vibrate) navigator.vibrate(7) }}
              >
                🏠 Return to Menu
              </button>
            )}
          </div>
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
          {onReturnToMenu && (
            <button
              onClick={() => {
                if (onReturnToMenu) {
                  onReturnToMenu()
                }
                const panel = document.getElementById('fab-panel'); if (panel) panel.style.display = 'none'
              }}
              style={{
                width: '100%',
                padding: '10px',
                marginTop: '6px',
                background: 'rgba(100, 150, 255, 0.9)',
                color: '#fff',
                border: '1px solid #fff',
                borderRadius: '6px'
              }}
              onMouseDown={() => { if (navigator && navigator.vibrate) navigator.vibrate(7) }}
              onTouchStart={() => { if (navigator && navigator.vibrate) navigator.vibrate(7) }}
            >🏠 Return to Menu</button>
          )}
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
