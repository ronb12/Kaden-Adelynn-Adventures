import React, { useRef, useEffect, useState } from 'react'
import { playSound } from '../utils/sounds'
import { playGameplayMusic, ensureMusicPlaying } from '../utils/music'
import { playersRef } from '../utils/cloudScores'
import './Game.css'

function Game({ selectedCharacter, selectedShip, difficulty }) {
  const canvasRef = useRef()
  const gameStateRef = useRef({
    player: { x: 400, y: 550, width: 30, height: 30 },
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
  })

  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [killStreak, setKillStreak] = useState(0)
  const [enemiesKilled, setEnemiesKilled] = useState(0)
  const [paused, setPaused] = useState(false)
  const [health, setHealth] = useState(100)
  const [lives, setLives] = useState(3)
  const [wave, setWave] = useState(1)
  const [level, setLevel] = useState(1)
  const [coins, setCoins] = useState(0)
  const [unlockedAchievements, setUnlockedAchievements] = useState({})
  const healthRef = useRef(100)
  const livesRef = useRef(3)
  const timeoutRefs = useRef([])
  const playerInput = useRef({ x: 0, y: 0, firing: false })

  const getPersonalBest = () => localStorage.getItem('personalBest') || 0

  const difficultyModifier = () => {
    return difficulty === 'easy' ? 1 : difficulty === 'medium' ? 1.5 : 2
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
      ctx.globalAlpha = 0.5
    }

    ctx.shadowBlur = 8
    ctx.shadowColor = accentColor

    ctx.fillStyle = shipColor
    ctx.beginPath()
    ctx.moveTo(state.player.x + state.player.width / 2, state.player.y)
    ctx.lineTo(state.player.x + state.player.width, state.player.y + state.player.height - 10)
    ctx.lineTo(state.player.x + state.player.width * 0.8, state.player.y + state.player.height)
    ctx.lineTo(state.player.x + state.player.width * 0.2, state.player.y + state.player.height)
    ctx.lineTo(state.player.x, state.player.y + state.player.height - 10)
    ctx.closePath()
    ctx.fill()

    ctx.fillStyle = accentColor
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
      const isSilver = enemy.type === 'silver'
      if (isSilver) {
        const grad = ctx.createLinearGradient(enemy.x, enemy.y, enemy.x + 30, enemy.y + 30)
        grad.addColorStop(0, '#c0c0c0')
        grad.addColorStop(0.5, '#8f8f8f')
        grad.addColorStop(1, '#e0e0e0')
        ctx.fillStyle = grad
        ctx.strokeStyle = '#9e9e9e'
        ctx.lineWidth = 2.5
      } else {
        ctx.fillStyle = '#ff0000'
        ctx.strokeStyle = '#cc0000'
        ctx.lineWidth = 2
      }

      ctx.beginPath()
      ctx.moveTo(enemy.x + 15, enemy.y)
      ctx.lineTo(enemy.x + 5, enemy.y + 25)
      ctx.lineTo(enemy.x + 25, enemy.y + 25)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = isSilver ? '#d5d5d5' : '#ff6666'
      ctx.beginPath()
      ctx.arc(enemy.x + 15, enemy.y + 8, 3, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()
    })
  }

  const drawBullets = (ctx, state) => {
    const bullets = state.bullets
    const len = bullets.length
    let lastColor = null

    for (let i = 0; i < len; i++) {
      const bullet = bullets[i]
      if (!bullet) continue

      const color = bullet.color || (bullet.owner === 'player' ? 'cyan' : 'red')
      const bw = bullet.width || 5
      const bh = bullet.height || 10

      if (color !== lastColor) {
        ctx.fillStyle = color
        lastColor = color
      }
      ctx.fillRect(bullet.x, bullet.y, bw, bh)
    }
  }

  const drawUI = (ctx, state) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const cw = canvas.width
    const isMobile = cw < 520
    const barH = isMobile ? 76 : 56

    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
    ctx.fillRect(0, 0, cw, barH)

    ctx.font = isMobile ? 'bold 11px Arial' : 'bold 13px Arial'
    const lineHeight = isMobile ? 18 : 26
    let row = 0
    let col = 0
    const colWidth = cw / 2
    
    const placeItem = (label, value, color) => {
      const y = 14 + row * lineHeight
      const x = 8 + col * colWidth
      
      ctx.fillStyle = color
      ctx.fillText(`${label}:${value}`, x, y)
      
      col++
      if (col >= 2) {
        col = 0
        row++
      }
    }

    const currentScore = state.currentScore || score
    placeItem('SCORE', currentScore.toString().padStart(6, '0'), '#4ecdc4')
    placeItem('❤', livesRef.current, '#ff6b6b')
    
    const healthValue = Math.round(Math.max(0, Math.min(100, healthRef.current)))
    const healthColor = healthValue <= 25 ? '#e74c3c' : healthValue <= 50 ? '#f39c12' : '#2ecc71'
    placeItem('HP', healthValue + '%', healthColor)

    const shotsFired = state.shotsFired || 0
    const shotsHit = state.shotsHit || 0
    let accuracy = 0
    if (shotsFired > 0) {
      accuracy = Math.round((shotsHit / shotsFired) * 100)
      accuracy = Math.max(0, Math.min(100, accuracy))
    }
    const accColor = accuracy >= 70 ? '#2ecc71' : accuracy >= 50 ? '#f39c12' : '#e74c3c'
    placeItem('ACC', accuracy + '%', accColor)

    placeItem('$', state.coins, '#ffd700')
    placeItem('KILL', state.currentKills || 0, '#95a5a6')
  }

  const spawnEnemies = (state) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const now = Date.now()
    const baseRate = state.wave <= 2 ? 2600 : state.wave <= 4 ? 2200 : 1800
    let spawnRate = baseRate / difficultyModifier()

    if (now - state.lastEnemySpawn > spawnRate) {
      const patternsEarly = ['normal', 'zigzag']
      const patternsMore = ['normal', 'zigzag', 'sway', 'dash']
      const pool = state.wave < 3 ? patternsEarly : patternsMore
      const pattern = pool[Math.floor(Math.random() * pool.length)]
      const baseSilverChance = state.wave >= 4 ? 0.4 : 0.25
      const isSilver = Math.random() < baseSilverChance
      const enemy = {
        x: Math.random() * (canvas.width - 30) + 15,
        y: -30,
        speed: difficultyModifier() * (isSilver ? 0.95 : state.wave < 3 ? 1.0 : 1.3),
        pattern,
        health: isSilver ? 4 : state.wave < 3 ? 1 : 2,
        type: isSilver ? 'silver' : 'red',
      }
      state.enemies.push(enemy)
      state.enemiesSpawned++

      state.lastEnemySpawn = now
    }
  }

  const spawnCollectibles = (state) => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Spawn coins from dead enemies
    if (state.scorePopups && state.scorePopups.length > 0) {
      const toRemove = []
      for (let i = 0; i < state.scorePopups.length; i++) {
        const popup = state.scorePopups[i]
        popup.life--
        if (popup.life <= 0) {
          // Chance to spawn coin
          if (Math.random() < 0.3) {
            state.coins++
            if (!state.powerUps) state.powerUps = []
            state.powerUps.push({
              x: popup.x,
              y: popup.y,
              type: 'coin',
              width: 10,
              height: 10,
              vy: -2,
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
      state.powerUps = state.powerUps.filter((p) => {
        p.y += p.vy
        p.vy += 0.3 // gravity
        return p.y < canvas.height + 50
      })
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
        const asteroidSize = Math.random() < 0.6 ? 'small' : 'medium'
        state.asteroids.push({
          x: Math.random() * canvas.width,
          y: -30,
          size: asteroidSize,
          width: asteroidSize === 'small' ? 15 : 25,
          height: asteroidSize === 'small' ? 15 : 25,
          speed: 1 + Math.random() * 2,
          rotation: 0,
          rotationSpeed: Math.random() * 0.1 - 0.05,
        })
        state.lastAsteroidSpawn = now
      }
    }
  }

  const drawAsteroids = (ctx, state) => {
    if (!state.asteroids) return
    state.asteroids.forEach((ast) => {
      ctx.save()
      ctx.translate(ast.x, ast.y)
      ctx.rotate(ast.rotation)
      ctx.fillStyle = '#8b7355'
      ctx.strokeStyle = '#5a4a3a'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(0, 0, ast.width / 2, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      ctx.fillStyle = '#a0826d'
      ctx.beginPath()
      ctx.arc(-ast.width / 5, -ast.height / 5, ast.width / 6, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    })
  }

  const drawCollectibles = (ctx, state) => {
    if (!state.powerUps) return
    state.powerUps.forEach((p) => {
      if (p.type === 'coin') {
        ctx.fillStyle = '#ffd700'
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.width / 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = '#ffed4e'
        ctx.lineWidth = 1
        ctx.stroke()
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

      if (enemy.pattern === 'zigzag') {
        enemy.x += Math.sin(enemy.y / 20) * 2 * timeScale
      } else if (enemy.pattern === 'sway') {
        enemy.x += Math.sin(enemy.y / 30) * 3 * timeScale
      } else if (enemy.pattern === 'dash') {
        if (Math.random() < 0.02) enemy.y += 20 * timeScale
      }

      // Keep enemies within canvas bounds (left/right)
      enemy.x = Math.max(5, Math.min(canvas.width - 35, enemy.x))

      const shootChance = 0.01 * difficultyModifier()
      if (Math.random() < shootChance && enemy.y > 50 && enemy.y < canvas.height - 100) {
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
            const newHealth = h - 1
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
  }

  const updateEnemyBullets = (state) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const timeScale = Math.min(state.deltaTime / 16.67, 2)

    state.enemyBullets = state.enemyBullets.filter((bullet) => {
      // Move bullet straight down
      const speed = bullet.speed || 3
      bullet.y += speed * timeScale
      
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
      color: '#00ffff',
    })

    state.shotsFired++
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

  const gameLoop = (state) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const now = Date.now()
    state.deltaTime = now - state.lastFrameTime
    state.lastFrameTime = now

    // Ensure music keeps playing
    if (!state.lastMusicCheck) state.lastMusicCheck = now
    if (now - state.lastMusicCheck > 2000) {
      ensureMusicPlaying()
      state.lastMusicCheck = now
    }

    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (!paused) {
      updatePlayer(state)
      updateBullets(state)
      updateEnemyBullets(state)
      spawnEnemies(state)
      spawnCollectibles(state)
      spawnAsteroids(state)
      updateEnemies(state)
      checkCollisions(state)
    }

    drawAsteroids(ctx, state)
    drawPlayer(ctx, state)
    drawEnemies(ctx, state)
    drawBullets(ctx, state)
    drawCollectibles(ctx, state)

    // Draw enemy bullets
    ctx.fillStyle = '#ff6666'
    state.enemyBullets.forEach((b) => {
      ctx.fillRect(b.x, b.y, b.width || 3, b.height || 8)
    })

    drawUI(ctx, state)

    if (!paused) {
      requestAnimationFrame(() => gameLoop(state))
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

    // Update on window resize
    window.addEventListener('resize', resizeCanvas)

    playGameplayMusic()
    const state = gameStateRef.current
    state.wave = wave
    state.level = level

    // Update canvas reference in state for collision checks
    state.canvasWidth = canvas.width
    state.canvasHeight = canvas.height

    const handleKeyDown = (e) => {
      state.keys[e.key] = true
    }
    const handleKeyUp = (e) => {
      state.keys[e.key] = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    gameLoop(state)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
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
      {paused && <div className='pause-overlay'>PAUSED</div>}
    </div>
  )
}

export default Game
