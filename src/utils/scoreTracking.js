// Score tracking utilities
export function getPersonalBest() {
  try {
    const saved = localStorage.getItem('personalBest')
    const score = saved ? parseInt(saved, 10) : 0
    return Number.isFinite(score) && score >= 0 ? score : 0
  } catch {
    return 0
  }
}

export function saveScore(score) {
  try {
    const currentBest = getPersonalBest()
    if (score > currentBest) {
      localStorage.setItem('personalBest', String(score))
      return true
    }
    return false
  } catch {
    return false
  }
}

export function getHighScores() {
  try {
    const saved = localStorage.getItem('highScores')
    if (!saved) return []
    const scores = JSON.parse(saved)
    return Array.isArray(scores) ? scores : []
  } catch {
    return []
  }
}

export function addHighScore(name, score, wave, level, kills, combo) {
  try {
    const scores = getHighScores()
    scores.push({ name, score, wave, level, kills, combo, date: Date.now() })
    scores.sort((a, b) => b.score - a.score)
    const topScores = scores.slice(0, 10) // Keep top 10
    localStorage.setItem('highScores', JSON.stringify(topScores))
    return topScores
  } catch {
    return []
  }
}

export function getMergedTopScores() {
  // For now, just return local scores
  // In the future, this could merge with cloud scores
  return getHighScores()
}
