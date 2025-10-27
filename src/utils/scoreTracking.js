// Score tracking system with localStorage

const STORAGE_KEY = 'kadenAdelynnScores'

export const saveScore = (score, playerName = 'Player') => {
  const scores = getHighScores()
  const newScore = {
    score: score,
    player: playerName,
    date: new Date().toISOString(),
    timestamp: Date.now()
  }
  
  scores.push(newScore)
  // Keep only top 10 scores
  scores.sort((a, b) => b.score - a.score)
  const topScores = scores.slice(0, 10)
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(topScores))
  return topScores
}

export const getHighScores = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (e) {
    return []
  }
}

export const clearScores = () => {
  localStorage.removeItem(STORAGE_KEY)
}

export const getPersonalBest = () => {
  const scores = getHighScores()
  return scores.length > 0 ? scores[0].score : 0
}

export const isNewHighScore = (score) => {
  const best = getPersonalBest()
  return score > best
}

export const formatScore = (score) => {
  return score.toString().padStart(8, '0')
}

export const getScoreStats = () => {
  const scores = getHighScores()
  return {
    totalGames: scores.length,
    averageScore: scores.length > 0 
      ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length)
      : 0,
    personalBest: getPersonalBest(),
    recentScores: scores.slice(0, 5)
  }
}

