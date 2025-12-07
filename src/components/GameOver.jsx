import { useState, useEffect } from 'react'
import { getHighScores, saveScore, getPersonalBest } from '../utils/scoreTracking'
import './GameOver.css'

function GameOver({ score, onRestart, onMenu, wave, level, kills, combo }) {
  const [highScores, setHighScores] = useState([])
  const [personalBest, setPersonalBest] = useState(0)
  const [isNewRecord, setIsNewRecord] = useState(false)

  useEffect(() => {
    const previousBest = getPersonalBest()
    setPersonalBest(previousBest)
    const newRecord = score > previousBest
    setIsNewRecord(newRecord)

    // Save the score after capturing previous best
    saveScore(score)

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
            <div className="stat-label">Wave</div>
            <div className="stat-value">{wave}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Level</div>
            <div className="stat-value">{level}</div>
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
              {highScores.slice(0, 5).map((scoreEntry, index) => (
                <div
                  key={index}
                  className={`leaderboard-entry ${scoreEntry.score === score ? 'current-score' : ''}`}
                >
                  <span className="leaderboard-rank">{index + 1}</span>
                  <span className="leaderboard-score">{scoreEntry.score.toLocaleString()}</span>
                  <span className="leaderboard-date">
                    {new Date(scoreEntry.date).toLocaleDateString()}
                  </span>
                </div>
              ))}
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
