// Load boss ship images
const bossImages = {}
let imagesLoaded = false

export const loadBossImages = () => {
  if (imagesLoaded) return Promise.resolve()

  const imagePromises = [
    { key: 'boss1', url: '/boss-ships/boss1.png' },
    { key: 'boss2', url: '/boss-ships/boss2.png' },
    { key: 'boss3', url: '/boss-ships/boss3.png' },
  ].map(
    ({ key, url }) =>
      new Promise((resolve) => {
        const img = new Image()
        img.onload = () => resolve({ key, img })
        img.onerror = () => {
          console.warn(`Failed to load boss image: ${url}`)
          resolve({ key, img: null })
        }
        img.src = url
      })
  )

  return Promise.all(imagePromises).then((results) => {
    results.forEach(({ key, img }) => {
      bossImages[key] = img
    })
    imagesLoaded = true
  })
}

export const getBossImage = (bossType) => {
  const imageMap = {
    asteroid: bossImages.boss1,
    alien: bossImages.boss2,
    robot: bossImages.boss3,
    dragon: bossImages.boss1,
  }
  return imageMap[bossType] || imageMap.asteroid
}

// Boss designs and patterns
export const bossTypes = {
  asteroid: {
    name: 'Asteroid King',
    health: 200,
    maxHealth: 200,
    speed: 1,
    color: '#8b4513',
    pattern: 'straight',
    reward: 1000,
    phase: 1,
    width: 150,
    height: 150,
    image: 'boss1',
  },
  alien: {
    name: 'Alien Mothership',
    health: 500,
    maxHealth: 500,
    speed: 2,
    color: '#7bff00',
    pattern: 'zigzag',
    reward: 2500,
    phase: 1,
    width: 180,
    height: 180,
    image: 'boss2',
  },
  robot: {
    name: 'Mechanical Overlord',
    health: 800,
    maxHealth: 800,
    speed: 1.5,
    color: '#ff00ff',
    pattern: 'circular',
    reward: 5000,
    phase: 1,
    width: 200,
    height: 200,
    image: 'boss3',
  },
  dragon: {
    name: 'Space Dragon',
    health: 1000,
    maxHealth: 1000,
    speed: 2.5,
    color: '#ff0000',
    pattern: 'dive',
    reward: 10000,
    phase: 1,
    width: 220,
    height: 220,
    image: 'boss1',
  },
}

export const spawnBoss = (type, x, y) => {
  return {
    ...bossTypes[type],
    x,
    y,
    angle: 0,
    shootTimer: 0,
    phaseTimer: 0,
    bullets: [],
  }
}

export const updateBossPattern = (boss, time, canvas) => {
  // Phase transitions based on remaining health
  const maxH = boss.maxHealth || boss.health
  const ratio = Math.max(0, boss.health / Math.max(1, maxH))
  if (ratio <= 0.4 && boss.phase < 3) {
    boss.phase = 3
    boss.pattern = boss.pattern === 'zigzag' ? 'circular' : 'dive'
    boss.color = '#ff3333'
    boss.speed = (boss.speed || 1) + 0.5
  } else if (ratio <= 0.7 && boss.phase < 2) {
    boss.phase = 2
    if (boss.pattern === 'straight') boss.pattern = 'zigzag'
    boss.color = '#ff9900'
    boss.speed = (boss.speed || 1) + 0.3
  }

  switch (boss.pattern) {
    case 'zigzag':
      boss.x += Math.sin(time * 0.1) * boss.speed * 2
      boss.x = Math.max(boss.width / 2, Math.min(canvas.width - boss.width / 2, boss.x))
      break
    case 'circular':
      boss.angle += 0.05
      boss.x = canvas.width / 2 + Math.cos(boss.angle) * 150
      boss.y = canvas.height / 4 + Math.sin(boss.angle) * 50
      break
    case 'dive':
      boss.y += Math.sin(time * 0.1) * 2
      if (boss.y > canvas.height / 2) boss.y = canvas.height / 4
      break
    default:
      if (boss.y > 100) boss.y -= boss.speed
  }

  boss.shootTimer++
  return boss
}
