import { ParticleSystem } from '../../utils/particles'
import { playSound } from '../../utils/sounds'
import { achievements, checkAchievement } from '../../utils/achievements'

// Split asteroid helper function
function splitAsteroid(state, asteroid) {
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

export function checkCollisions(
  state,
  {
    setScore,
    setCombo,
    setKillStreak,
    setEnemiesKilled,
    setCoins,
    setHealth,
    setLives,
    setUnlockedAchievements,
    combo,
    enemiesKilled,
    health,
    canvasRef,
    timeoutRefs,
  }
) {
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
        // Track hit
        state.shotsHit++
        // Update score - sync with gameState
        const points = Math.floor(10 * state.scoreMultiplier)
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
          // Limit particle creation to prevent overflow
          if (state.particles.length < 120) {
            state.particles.push(
              ...ParticleSystem.createExplosion(enemy.x + 15, enemy.y + 15, '#ff6666', 12)
            )
          }
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
        // Track hit
        state.shotsHit++
        // Boss takes damage
        state.boss.health -= Math.max(10, 20 * (state.damageMul || 1))

        // Remove bullet unless it's piercing
        if (!bullet.pierce) {
          bulletsToRemove.push(i)
        }

        // Add hit effect
        playSound('hit', 0.3)
        // Limit particle creation to prevent overflow
        if (state.particles.length < 120) {
          state.particles.push(...ParticleSystem.createExplosion(bullet.x, bullet.y, '#ff0080', 10))
        }

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
          // Track hit
          state.shotsHit++
          // damage asteroid
          asteroid.health =
            (typeof asteroid.health === 'number' ? asteroid.health : 2) - (state.damageMul || 1)
          // remove bullet unless piercing
          if (!bullet.pierce) bulletsToRemove.push(i)
          playSound('hit', 0.3)
          // Limit particle creation to prevent overflow
          if (state.particles.length < 120) {
            state.particles.push(
              ...ParticleSystem.createExplosion(bullet.x, bullet.y, '#ffa502', 8)
            )
          }
          if (asteroid.health <= 0) {
            // split into smaller pieces
            splitAsteroid(state, asteroid)
            asteroidsToRemove.push(a)
            // Limit particle creation to prevent overflow
            if (state.particles.length < 100) {
              state.particles.push(
                ...ParticleSystem.createExplosion(asteroid.x, asteroid.y, '#ffa502', 20)
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
          // Explosion feedback
          playSound('hit', 0.5)
          // Limit particle creation to prevent overflow
          if (state.particles.length < 120) {
            state.particles.push(
              ...ParticleSystem.createExplosion(enemy.x + 15, enemy.y + 15, '#ff8c00', 15)
            )
          }
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
          // Track hit
          state.shotsHit++
          playSound('hit', 0.4)
          // Limit particle creation to prevent overflow
          if (state.particles.length < 120) {
            state.particles.push(
              ...ParticleSystem.createExplosion(enemy.x + 15, enemy.y + 15, '#00ffff', 10)
            )
          }
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
          // Limit particle creation to prevent overflow
          if (state.particles.length < 100) {
            state.particles.push(
              ...ParticleSystem.createExplosion(asteroidX, asteroidY, '#ff8c00', 15)
            )
          }
          
          // Damage the asteroid (but don't remove it - let it continue)
          asteroid.health = (typeof asteroid.health === 'number' ? asteroid.health : 2) - 1
          
          // Only remove asteroid if it's destroyed
          if (asteroid.health <= 0) {
            splitAsteroid(state, asteroid)
            asteroidsToRemove.push(i)
            // Limit particle creation to prevent overflow
            if (state.particles.length < 100) {
              state.particles.push(
                ...ParticleSystem.createExplosion(asteroidX, asteroidY, '#ffa502', 20)
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
          console.log('HIT by enemy bullet. Health:', h, '->', Math.max(0, newHealth))
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
          // Limit particle creation to prevent overflow
          if (state.particles.length < 100) {
            state.particles.push(...ParticleSystem.createExplosion(ast.x, ast.y, '#ff8c00', 20))
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
          // Limit particle creation to prevent overflow
          if (state.particles.length < 100) {
            state.particles.push(...ParticleSystem.createExplosion(cx, cy, '#00ffff', 10))
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

