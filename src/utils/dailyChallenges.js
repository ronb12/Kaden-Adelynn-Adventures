// Enhanced daily challenges system with specific objectives

const CHALLENGES_KEY = 'dailyChallenges'
const CHALLENGE_OVERRIDE_KEY = 'challengeOverride'

// Challenge types
export const challengeTypes = {
  killCount: {
    name: 'Eliminator',
    description: 'Kill {target} enemies',
    generate: () => ({
      type: 'killCount',
      target: Math.floor(Math.random() * 50) + 30, // 30-80 kills
      reward: 200,
    }),
    check: (gameData) => gameData.kills >= gameData.target,
  },
  scoreTarget: {
    name: 'High Scorer',
    description: 'Score {target} points',
    generate: () => ({
      type: 'scoreTarget',
      target: Math.floor(Math.random() * 50000) + 20000, // 20k-70k
      reward: 300,
    }),
    check: (gameData) => gameData.score >= gameData.target,
  },
  waveReach: {
    name: 'Wave Warrior',
    description: 'Reach wave {target}',
    generate: () => ({
      type: 'waveReach',
      target: Math.floor(Math.random() * 5) + 3, // Wave 3-8
      reward: 250,
    }),
    check: (gameData) => gameData.wave >= gameData.target,
  },
  noDamage: {
    name: 'Perfect Run',
    description: 'Complete wave {target} without taking damage',
    generate: () => ({
      type: 'noDamage',
      target: Math.floor(Math.random() * 3) + 2, // Wave 2-5
      reward: 400,
    }),
    check: (gameData) => gameData.wave >= gameData.target && gameData.damageTaken === 0,
  },
  weaponSpecific: {
    name: 'Weapon Master',
    description: 'Kill {target} enemies with {weapon}',
    generate: () => {
      const weapons = ['laser', 'spread', 'plasma', 'missile', 'homing']
      const weapon = weapons[Math.floor(Math.random() * weapons.length)]
      return {
        type: 'weaponSpecific',
        weapon,
        target: Math.floor(Math.random() * 30) + 20, // 20-50 kills
        reward: 350,
      }
    },
    check: (gameData) => gameData.weaponKills?.[gameData.weapon] >= gameData.target,
  },
  comboChallenge: {
    name: 'Combo King',
    description: 'Achieve a combo of {target}',
    generate: () => ({
      type: 'comboChallenge',
      target: Math.floor(Math.random() * 20) + 15, // Combo 15-35
      reward: 300,
    }),
    check: (gameData) => gameData.maxCombo >= gameData.target,
  },
  bossKill: {
    name: 'Boss Slayer',
    description: 'Defeat {target} boss(es)',
    generate: () => ({
      type: 'bossKill',
      target: Math.floor(Math.random() * 2) + 1, // 1-2 bosses
      reward: 500,
    }),
    check: (gameData) => gameData.bossesDefeated >= gameData.target,
  },
  accuracy: {
    name: 'Sharpshooter',
    description: 'Achieve {target}% accuracy',
    generate: () => ({
      type: 'accuracy',
      target: Math.floor(Math.random() * 20) + 60, // 60-80%
      reward: 400,
    }),
    check: (gameData) => {
      const accuracy = gameData.shotsFired > 0
        ? (gameData.shotsHit / gameData.shotsFired) * 100
        : 0
      return accuracy >= gameData.target
    },
  },
}

// Get today's date key
function getTodayKey() {
  return new Date().toISOString().split('T')[0]
}

// Get current daily challenges
export function getDailyChallenges() {
  try {
    const saved = localStorage.getItem(CHALLENGES_KEY)
    if (!saved) {
      return generateDailyChallenges()
    }
    
    const challenges = JSON.parse(saved)
    const today = getTodayKey()
    
    // Check if challenges are for today
    if (challenges.date !== today) {
      return generateDailyChallenges()
    }
    
    return challenges
  } catch {
    return generateDailyChallenges()
  }
}

// Generate new daily challenges
export function generateDailyChallenges() {
  const today = getTodayKey()
  const challengeKeys = Object.keys(challengeTypes)
  
  // Select 3 random challenges
  const selected = []
  const used = new Set()
  
  while (selected.length < 3 && selected.length < challengeKeys.length) {
    const randomKey = challengeKeys[Math.floor(Math.random() * challengeKeys.length)]
    if (!used.has(randomKey)) {
      used.add(randomKey)
      const challengeDef = challengeTypes[randomKey]
      const challenge = challengeDef.generate()
      challenge.id = `${randomKey}_${Date.now()}_${selected.length}`
      challenge.completed = false
      challenge.progress = 0
      selected.push(challenge)
    }
  }
  
  const challenges = {
    date: today,
    challenges: selected,
  }
  
  try {
    localStorage.setItem(CHALLENGES_KEY, JSON.stringify(challenges))
  } catch {
    // Ignore save errors
  }
  
  return challenges
}

// Update challenge progress
export function updateChallengeProgress(gameData) {
  const daily = getDailyChallenges()
  let updated = false
  
  for (const challenge of daily.challenges) {
    if (challenge.completed) continue
    
    const challengeDef = challengeTypes[challenge.type]
    if (!challengeDef) continue
    
    // Update progress based on challenge type
    switch (challenge.type) {
      case 'killCount':
        challenge.progress = Math.min(gameData.kills || 0, challenge.target)
        break
      case 'scoreTarget':
        challenge.progress = Math.min(gameData.score || 0, challenge.target)
        break
      case 'waveReach':
        challenge.progress = Math.min(gameData.wave || 0, challenge.target)
        break
      case 'noDamage':
        challenge.progress = gameData.wave || 0
        if (gameData.damageTaken > 0) challenge.progress = 0
        break
      case 'weaponSpecific':
        challenge.progress = Math.min(
          gameData.weaponKills?.[challenge.weapon] || 0,
          challenge.target
        )
        break
      case 'comboChallenge':
        challenge.progress = Math.min(gameData.maxCombo || 0, challenge.target)
        break
      case 'bossKill':
        challenge.progress = Math.min(gameData.bossesDefeated || 0, challenge.target)
        break
      case 'accuracy':
        if (gameData.shotsFired > 0) {
          challenge.progress = Math.min(
            (gameData.shotsHit / gameData.shotsFired) * 100,
            challenge.target
          )
        }
        break
    }
    
    // Check if completed
    if (challengeDef.check({ ...gameData, ...challenge })) {
      challenge.completed = true
      challenge.completedAt = Date.now()
      updated = true
    }
  }
  
  if (updated) {
    try {
      localStorage.setItem(CHALLENGES_KEY, JSON.stringify(daily))
    } catch {
      // Ignore save errors
    }
  }
  
  return daily
}

// Get completed challenges for today
export function getCompletedChallenges() {
  const daily = getDailyChallenges()
  return daily.challenges.filter(c => c.completed)
}

// Get total reward for completed challenges
export function getTotalChallengeReward() {
  const completed = getCompletedChallenges()
  return completed.reduce((sum, c) => sum + (c.reward || 0), 0)
}

// Claim challenge rewards
export function claimChallengeRewards() {
  const completed = getCompletedChallenges()
  const totalReward = getTotalChallengeReward()
  
  // Import wallet functions
  const { addCoins } = require('./wallet')
  addCoins(totalReward)
  
  return totalReward
}

// Override challenge (for testing)
export function overrideChallenge(challengeIndex) {
  try {
    localStorage.setItem(CHALLENGE_OVERRIDE_KEY, String(challengeIndex))
    return true
  } catch {
    return false
  }
}
