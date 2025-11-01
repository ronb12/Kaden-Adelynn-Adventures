// Score tracking system with localStorage + optional Firestore via Hosting init
import { saveCloudScore, fetchTopScores, cloudAvailable } from './cloudScores'

const STORAGE_KEY = 'kadenAdelynnScores'

export const saveScore = (score, playerName = 'Player') => {
  // Try cloud first (fire-and-forget)
  cloudAvailable().then((ok) => { if (ok) saveCloudScore(score, playerName) })
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

export const getMergedTopScores = async () => {
  const local = getHighScores()
  const cloud = await fetchTopScores(10)
  const merged = [...local]
  cloud.forEach(c => {
    merged.push({ score: c.score || 0, player: c.player || 'Player', date: c.createdAt?.toDate?.()?.toISOString?.() || '', timestamp: 0 })
  })
  merged.sort((a,b)=> (b.score||0)-(a.score||0))
  return merged.slice(0,10)
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

