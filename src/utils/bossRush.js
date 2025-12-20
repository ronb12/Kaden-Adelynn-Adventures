// Boss Rush mode - back-to-back boss fights with time-based scoring

const BOSS_RUSH_KEY = 'bossRushRecords'

export const bossRushConfig = {
  bossesPerRun: 5, // Number of bosses in a rush
  timeBonusMultiplier: 10, // Points per second remaining
  perfectKillBonus: 500, // Bonus for no damage
  speedBonusThresholds: [
    { time: 30, bonus: 1000 }, // Under 30 seconds
    { time: 60, bonus: 500 },   // Under 60 seconds
    { time: 120, bonus: 200 },  // Under 2 minutes
  ],
}

export function startBossRush() {
  return {
    currentBoss: 0,
    bossesDefeated: 0,
    totalTime: 0,
    startTime: Date.now(),
    bossStartTime: Date.now(),
    bossKillTimes: [],
    damageTaken: 0,
    perfectKills: 0,
    score: 0,
    isActive: true,
  }
}

export function updateBossRush(rushState, gameState) {
  if (!rushState || !rushState.isActive) return rushState
  
  const now = Date.now()
  rushState.totalTime = now - rushState.startTime
  
  // Check if boss was defeated
  if (gameState.boss && gameState.boss.health <= 0 && !gameState.isBossFight) {
    // Boss was just defeated
    const bossKillTime = (now - rushState.bossStartTime) / 1000 // in seconds
    rushState.bossKillTimes.push(bossKillTime)
    rushState.bossesDefeated++
    
    // Check for perfect kill (no damage during boss fight)
    if (gameState.player.health >= 100) {
      rushState.perfectKills++
    }
    
    // Calculate score for this boss
    let bossScore = 1000 * (rushState.bossesDefeated + 1) // Base score increases per boss
    
    // Time bonus
    const timeBonus = Math.max(0, 120 - bossKillTime) * bossRushConfig.timeBonusMultiplier
    bossScore += timeBonus
    
    // Speed bonus
    for (const threshold of bossRushConfig.speedBonusThresholds) {
      if (bossKillTime <= threshold.time) {
        bossScore += threshold.bonus
        break
      }
    }
    
    // Perfect kill bonus
    if (gameState.player.health >= 100) {
      bossScore += bossRushConfig.perfectKillBonus
    }
    
    rushState.score += bossScore
    
    // Move to next boss or complete
    if (rushState.bossesDefeated >= bossRushConfig.bossesPerRun) {
      rushState.isActive = false
      rushState.completed = true
      rushState.completionTime = rushState.totalTime / 1000
      
      // Final bonus
      const completionBonus = Math.max(0, 600 - rushState.totalTime / 1000) * 50
      rushState.score += completionBonus
      
      saveBossRushRecord(rushState)
    } else {
      // Prepare for next boss
      rushState.currentBoss++
      rushState.bossStartTime = now
    }
  }
  
  return rushState
}

export function saveBossRushRecord(rushState) {
  try {
    const records = getBossRushRecords()
    
    const record = {
      id: `bossrush_${Date.now()}`,
      timestamp: Date.now(),
      score: rushState.score,
      bossesDefeated: rushState.bossesDefeated,
      totalTime: rushState.totalTime / 1000, // in seconds
      perfectKills: rushState.perfectKills,
      bossKillTimes: rushState.bossKillTimes,
      averageBossTime: rushState.bossKillTimes.length > 0
        ? rushState.bossKillTimes.reduce((a, b) => a + b, 0) / rushState.bossKillTimes.length
        : 0,
    }
    
    records.push(record)
    records.sort((a, b) => b.score - a.score) // Sort by score descending
    
    // Keep top 10
    const topRecords = records.slice(0, 10)
    localStorage.setItem(BOSS_RUSH_KEY, JSON.stringify(topRecords))
    
    return record
  } catch (error) {
    console.error('Failed to save boss rush record:', error)
    return null
  }
}

export function getBossRushRecords() {
  try {
    const saved = localStorage.getItem(BOSS_RUSH_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

export function getBestBossRushScore() {
  const records = getBossRushRecords()
  return records.length > 0 ? records[0].score : 0
}

export function getFastestBossRush() {
  const records = getBossRushRecords()
  if (records.length === 0) return null
  
  return records.reduce((fastest, record) => {
    return !fastest || record.totalTime < fastest.totalTime ? record : fastest
  }, null)
}
