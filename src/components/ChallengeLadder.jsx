import { useState, useEffect } from 'react'
import './ChallengeLadder.css'

function ChallengeLadder({ onClose }) {
  const [completedDays, setCompletedDays] = useState(() => {
    const saved = localStorage.getItem('challengeLadderCompleted')
    return saved ? JSON.parse(saved) : []
  })
  const [selectedDay, setSelectedDay] = useState(1)

  const getDailyChallenge = (dayNumber) => {
    const daySeed = new Date(2024, 0, dayNumber).toISOString().slice(0, 10)
    const hash = Array.from(daySeed).reduce((a, c) => (((a << 5) - a) + c.charCodeAt(0)) | 0, 0)
    const challengeIdx = Math.abs(hash) % 3
    const challenges = ['Fast Enemies', 'Low Gravity', 'Double Powerups']
    return {
      label: challenges[challengeIdx],
      description: challengeIdx === 0 ? '⚡ Enemies spawn 20% faster' :
                   challengeIdx === 1 ? '🌌 Reduced gravity' :
                   '✨ Double powerups'
    }
  }

  const isUnlocked = (dayNumber) => {
    if (dayNumber === 1) return true
    return completedDays.includes(dayNumber - 1)
  }

  return (
    <div className="challenge-ladder-page">
      <div className="challenge-ladder-background">
        <div className="challenge-ladder-stars"></div>
      </div>

      <div className="challenge-ladder-container">
        <header className="challenge-ladder-header">
          <div className="challenge-ladder-header-content">
            <h1 className="challenge-ladder-main-title">
              <span className="challenge-ladder-title-icon">🏁</span>
              Challenge Ladder
            </h1>
            <p className="challenge-ladder-header-subtitle">Complete a challenge to unlock the next one (1–365)</p>
          </div>
          <button className="challenge-ladder-back-button" onClick={onClose}>
            <span className="back-icon">←</span>
            Back to Menu
          </button>
        </header>

        <div className="challenge-ladder-section">
          <div className="challenge-ladder-list">
            {Array.from({ length: 365 }, (_, i) => i + 1).map((dayNumber) => {
              const challenge = getDailyChallenge(dayNumber)
              const unlocked = isUnlocked(dayNumber)
              const completed = completedDays.includes(dayNumber)
              
              return (
                <div
                  key={dayNumber}
                  className={`challenge-ladder-row ${unlocked ? 'unlocked' : 'locked'} ${completed ? 'completed' : ''}`}
                  onClick={() => unlocked && setSelectedDay(dayNumber)}
                >
                  <div className="challenge-ladder-row-number">#{dayNumber}</div>
                  <div className="challenge-ladder-row-content">
                    <div className="challenge-ladder-row-label">{challenge.label}</div>
                    <div className="challenge-ladder-row-description">{challenge.description}</div>
                  </div>
                  <div className="challenge-ladder-row-status">
                    {completed ? '✓' : unlocked ? '▶' : '🔒'}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChallengeLadder

