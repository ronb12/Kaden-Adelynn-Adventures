// Achievement system
export const achievements = {
  firstKill: { id: 'first-kill', name: 'First Victory', desc: 'Destroy your first enemy', unlocked: false, reward: 100 },
  combo10: { id: 'combo-10', name: 'Combo Master', desc: 'Achieve a 10-hit combo', unlocked: false, reward: 200 },
  noDamageBoss: { id: 'no-damage-boss', name: 'Untouchable', desc: 'Defeat a boss without taking damage', unlocked: false, reward: 500 },
  perfectWave: { id: 'perfect-wave', name: 'Perfect Wave', desc: 'Complete a wave without missing', unlocked: false, reward: 300 },
  speedRunner: { id: 'speed-runner', name: 'Speed Runner', desc: 'Complete level 5 in under 5 minutes', unlocked: false, reward: 400 },
  collector: { id: 'collector', name: 'Collector', desc: 'Collect 50 power-ups', unlocked: false, reward: 250 },
  sharpshooter: { id: 'sharpshooter', name: 'Sharpshooter', desc: 'Get 100 headshots', unlocked: false, reward: 350 },
  survivor: { id: 'survivor', name: 'Survivor', desc: 'Survive 1000 enemies', unlocked: false, reward: 500 },
  millionaire: { id: 'millionaire', name: 'Millionaire', desc: 'Score 1 million points', unlocked: false, reward: 1000 },
  destroyer: { id: 'destroyer', name: 'Destroyer', desc: 'Destroy 10,000 enemies', unlocked: false, reward: 2000 },
}

export const checkAchievement = (achievementId, setAchievements) => {
  if (!achievements[achievementId].unlocked) {
    achievements[achievementId].unlocked = true
    setAchievements(prev => [...prev, achievements[achievementId]])
    return achievements[achievementId]
  }
  return null
}

