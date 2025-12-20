// Score tracking utilities
const SCORES_KEY = 'spaceAdventureScores'
const PERSONAL_BEST_KEY = 'personalBest'

export const getHighScores = () => {
  try {
    const scores = localStorage.getItem(SCORES_KEY)
    return scores ? JSON.parse(scores) : []
  } catch {
    return []
  }
}

export const saveScore = (name, score, wave, level) => {
  const scores = getHighScores()
  scores.push({ name, score, wave, level, date: Date.now() })
  scores.sort((a, b) => b.score - a.score)
  const topScores = scores.slice(0, 10)
  localStorage.setItem(SCORES_KEY, JSON.stringify(topScores))
  
  const currentBest = getPersonalBest()
  if (score > currentBest) {
    localStorage.setItem(PERSONAL_BEST_KEY, score.toString())
  }
  
  return topScores
}

export const getPersonalBest = () => {
  return parseInt(localStorage.getItem(PERSONAL_BEST_KEY) || '0', 10)
}

export const clearScores = () => {
  localStorage.removeItem(SCORES_KEY)
  localStorage.removeItem(PERSONAL_BEST_KEY)
}

export const getMergedTopScores = () => {
  return getHighScores()
}
