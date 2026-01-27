import { useState, useEffect, useRef } from 'react'
import { getHighScores, saveScore, getPersonalBest } from '../utils/scoreTracking'
import './GameOver.css'

function GameOver({ score, onRestart, onMenu, wave, level, kills, combo }) {
  const [highScores, setHighScores] = useState([])
  const [personalBest, setPersonalBest] = useState(0)
  const [isNewRecord, setIsNewRecord] = useState(false)
  const hasSavedScore = useRef(false)

  useEffect(() => {
    // Prevent duplicate score saving - only save once per component mount
    if (hasSavedScore.current) return
    
    // Check previous best BEFORE saving to ensure correct "NEW RECORD" logic
    const previousBest = getPersonalBest()
    setPersonalBest(previousBest)
    const newRecord = score > previousBest
    setIsNewRecord(newRecord)

    // Save the score after capturing previous best
    saveScore(score)
    hasSavedScore.current = true

    // Load top scores
    setHighScores(getHighScores())
  }, [score])

  return (
    <div className="game-over-overlay">
      <div className="game-over-container">
        <div className="game-over-header">
          <h1 className="game-over-title">Game Over!</h1>
          {isNewRecord && <div className="new-record-badge">🎉 NEW RECORD!</div>}
        </div>

        <div className="score-display">
          <div className="final-score-container">
            <h2>Your Score</h2>
            <div className="final-score">{score.toLocaleString()}</div>
            {isNewRecord && (
              <p className="previous-best">Previous Best: {personalBest.toLocaleString()}</p>
            )}
            {!isNewRecord && personalBest > 0 && (
              <p className="personal-best">Personal Best: {personalBest.toLocaleString()}</p>
            )}
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-label">Level</div>
            <div className="stat-value">{level} / 100</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Kills</div>
            <div className="stat-value">{kills}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Best Combo</div>
            <div className="stat-value">{combo}</div>
          </div>
        </div>

        {highScores.length > 0 && (
          <div className="leaderboard">
            <h3>Top Scores</h3>
            <div className="leaderboard-list">
              {highScores.slice(0, 5).map((scoreEntry, index) => {
                // Safe date parsing with fallback
                let dateString = 'N/A'
                try {
                  if (scoreEntry.date) {
                    const date = new Date(scoreEntry.date)
                    if (!isNaN(date.getTime())) {
                      dateString = date.toLocaleDateString()
                    }
                  }
                } catch {
                  // Fallback to timestamp if date parsing fails
                  if (scoreEntry.timestamp) {
                    try {
                      dateString = new Date(scoreEntry.timestamp).toLocaleDateString()
                    } catch {
                      dateString = 'N/A'
                    }
                  }
                }
                
                // Safe score formatting
                const displayScore = (scoreEntry.score || 0).toLocaleString()
                const entryKey = `${scoreEntry.timestamp || index}-${scoreEntry.score || 0}`
                
                return (
                  <div
                    key={entryKey}
                    className={`leaderboard-entry ${scoreEntry.score === score ? 'current-score' : ''}`}
                  >
                    <span className="leaderboard-rank">{index + 1}</span>
                    <span className="leaderboard-score">{displayScore}</span>
                    <span className="leaderboard-date">{dateString}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="game-over-actions">
          <button className="btn-restart" onClick={onRestart}>
            🎮 Play Again
          </button>
          <button className="btn-menu" onClick={onMenu}>
            🏠 Main Menu
          </button>
        </div>
      </div>
    </div>
  )
}

export default GameOver
