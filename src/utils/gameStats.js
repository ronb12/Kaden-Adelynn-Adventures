// Comprehensive game statistics tracking
// Tracks all player stats for the statistics dashboard

const STATS_KEY = 'gameStats'
const SESSION_STATS_KEY = 'sessionStats'

// Initialize stats structure
function getDefaultStats() {
  return {
    // Overall stats
    totalGamesPlayed: 0,
    totalPlayTime: 0, // in seconds
    totalScore: 0,
    totalKills: 0,
    totalDeaths: 0,
    totalWavesCompleted: 0,
    totalBossesDefeated: 0,
    
    // Weapon stats
    weaponsUsed: {}, // { weaponName: { count: 0, kills: 0, damage: 0, accuracy: 0 } }
    favoriteWeapon: null,
    totalShotsFired: 0,
    totalShotsHit: 0,
    
    // Performance stats
    highestScore: 0,
    highestWave: 0,
    highestCombo: 0,
    highestKills: 0,
    bestAccuracy: 0,
    averageScore: 0,
    averageWave: 0,
    averageKills: 0,
    
    // Power-up stats
    powerUpsCollected: {}, // { powerUpType: count }
    totalPowerUpsCollected: 0,
    
    // Achievement stats
    achievementsUnlocked: 0,
    totalAchievements: 0,
    
    // Time-based stats
    firstPlayDate: null,
    lastPlayDate: null,
    longestSession: 0, // in seconds
    averageSessionTime: 0,
    
    // Difficulty stats
    gamesByDifficulty: { easy: 0, medium: 0, hard: 0 },
    bestScoreByDifficulty: { easy: 0, medium: 0, hard: 0 },
    
    // Combo stats
    totalCombos: 0,
    highestComboStreak: 0,
    averageCombo: 0,
    
    // Boss stats
    bossKillTimes: [], // Array of kill times in seconds
    averageBossKillTime: 0,
    fastestBossKill: 0,
    
    // Daily stats
    dailyStats: {}, // { date: { games: 0, score: 0, kills: 0 } }
    currentStreak: 0,
    longestStreak: 0,
  }
}

export function getStats() {
  try {
    const saved = localStorage.getItem(STATS_KEY)
    if (!saved) return getDefaultStats()
    const stats = JSON.parse(saved)
    // Merge with default to ensure all fields exist
    return { ...getDefaultStats(), ...stats }
  } catch {
    return getDefaultStats()
  }
}

export function saveStats(stats) {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats))
    return true
  } catch {
    return false
  }
}

export function updateStats(gameData) {
  const stats = getStats()
  const now = Date.now()
  
  // Overall stats
  stats.totalGamesPlayed++
  if (gameData.playTime) stats.totalPlayTime += gameData.playTime
  if (gameData.score) stats.totalScore += gameData.score
  if (gameData.kills) stats.totalKills += gameData.kills
  if (gameData.wave) stats.totalWavesCompleted += gameData.wave
  if (gameData.bossesDefeated) stats.totalBossesDefeated += gameData.bossesDefeated
  
  // Performance stats
  if (gameData.score && gameData.score > stats.highestScore) {
    stats.highestScore = gameData.score
  }
  if (gameData.wave && gameData.wave > stats.highestWave) {
    stats.highestWave = gameData.wave
  }
  if (gameData.combo && gameData.combo > stats.highestCombo) {
    stats.highestCombo = gameData.combo
  }
  if (gameData.kills && gameData.kills > stats.highestKills) {
    stats.highestKills = gameData.kills
  }
  
  // Calculate averages
  if (stats.totalGamesPlayed > 0) {
    stats.averageScore = Math.round(stats.totalScore / stats.totalGamesPlayed)
    stats.averageWave = Math.round(stats.totalWavesCompleted / stats.totalGamesPlayed)
    stats.averageKills = Math.round(stats.totalKills / stats.totalGamesPlayed)
  }
  
  // Weapon stats
  if (gameData.weapon) {
    if (!stats.weaponsUsed[gameData.weapon]) {
      stats.weaponsUsed[gameData.weapon] = { count: 0, kills: 0, damage: 0, shotsFired: 0, shotsHit: 0 }
    }
    stats.weaponsUsed[gameData.weapon].count++
    if (gameData.kills) stats.weaponsUsed[gameData.weapon].kills += gameData.kills
    if (gameData.shotsFired) stats.weaponsUsed[gameData.weapon].shotsFired += gameData.shotsFired
    if (gameData.shotsHit) stats.weaponsUsed[gameData.weapon].shotsHit += gameData.shotsHit
    
    // Calculate accuracy
    const weapon = stats.weaponsUsed[gameData.weapon]
    if (weapon.shotsFired > 0) {
      weapon.accuracy = Math.round((weapon.shotsHit / weapon.shotsFired) * 100)
    }
    
    // Update favorite weapon (most used)
    let maxCount = 0
    let favorite = null
    for (const [weapon, data] of Object.entries(stats.weaponsUsed)) {
      if (data.count > maxCount) {
        maxCount = data.count
        favorite = weapon
      }
    }
    stats.favoriteWeapon = favorite
  }
  
  // Overall accuracy
  if (gameData.shotsFired) stats.totalShotsFired += gameData.shotsFired
  if (gameData.shotsHit) stats.totalShotsHit += gameData.shotsHit
  if (stats.totalShotsFired > 0) {
    stats.bestAccuracy = Math.round((stats.totalShotsHit / stats.totalShotsFired) * 100)
  }
  
  // Power-up stats
  if (gameData.powerUpsCollected) {
    for (const [type, count] of Object.entries(gameData.powerUpsCollected)) {
      if (!stats.powerUpsCollected[type]) stats.powerUpsCollected[type] = 0
      stats.powerUpsCollected[type] += count
      stats.totalPowerUpsCollected += count
    }
  }
  
  // Difficulty stats
  if (gameData.difficulty) {
    if (!stats.gamesByDifficulty[gameData.difficulty]) {
      stats.gamesByDifficulty[gameData.difficulty] = 0
    }
    stats.gamesByDifficulty[gameData.difficulty]++
    
    if (gameData.score && gameData.score > (stats.bestScoreByDifficulty[gameData.difficulty] || 0)) {
      stats.bestScoreByDifficulty[gameData.difficulty] = gameData.score
    }
  }
  
  // Combo stats
  if (gameData.combo) {
    stats.totalCombos++
    if (gameData.combo > stats.highestComboStreak) {
      stats.highestComboStreak = gameData.combo
    }
    stats.averageCombo = Math.round(
      (stats.averageCombo * (stats.totalCombos - 1) + gameData.combo) / stats.totalCombos
    )
  }
  
  // Boss stats
  if (gameData.bossKillTime) {
    stats.bossKillTimes.push(gameData.bossKillTime)
    if (stats.bossKillTimes.length > 100) {
      stats.bossKillTimes = stats.bossKillTimes.slice(-100) // Keep last 100
    }
    if (stats.bossKillTimes.length > 0) {
      const sum = stats.bossKillTimes.reduce((a, b) => a + b, 0)
      stats.averageBossKillTime = Math.round(sum / stats.bossKillTimes.length)
      stats.fastestBossKill = Math.min(...stats.bossKillTimes)
    }
  }
  
  // Time-based stats
  if (!stats.firstPlayDate) stats.firstPlayDate = now
  stats.lastPlayDate = now
  if (gameData.playTime && gameData.playTime > stats.longestSession) {
    stats.longestSession = gameData.playTime
  }
  if (stats.totalGamesPlayed > 0) {
    stats.averageSessionTime = Math.round(stats.totalPlayTime / stats.totalGamesPlayed)
  }
  
  // Daily stats
  const today = new Date().toISOString().split('T')[0]
  if (!stats.dailyStats[today]) {
    stats.dailyStats[today] = { games: 0, score: 0, kills: 0 }
  }
  stats.dailyStats[today].games++
  if (gameData.score) stats.dailyStats[today].score += gameData.score
  if (gameData.kills) stats.dailyStats[today].kills += gameData.kills
  
  // Clean up old daily stats (keep last 30 days)
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  for (const date of Object.keys(stats.dailyStats)) {
    if (date < thirtyDaysAgo) {
      delete stats.dailyStats[date]
    }
  }
  
  // Streak calculation
  const dates = Object.keys(stats.dailyStats).sort()
  let currentStreak = 0
  let checkDate = new Date()
  for (let i = dates.length - 1; i >= 0; i--) {
    const dateStr = checkDate.toISOString().split('T')[0]
    if (dates.includes(dateStr)) {
      currentStreak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }
  stats.currentStreak = currentStreak
  if (currentStreak > stats.longestStreak) {
    stats.longestStreak = currentStreak
  }
  
  saveStats(stats)
  return stats
}

export function getSessionStats() {
  try {
    const saved = sessionStorage.getItem(SESSION_STATS_KEY)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

export function saveSessionStats(stats) {
  try {
    sessionStorage.setItem(SESSION_STATS_KEY, JSON.stringify(stats))
    return true
  } catch {
    return false
  }
}

export function resetStats() {
  try {
    localStorage.removeItem(STATS_KEY)
    return true
  } catch {
    return false
  }
}
