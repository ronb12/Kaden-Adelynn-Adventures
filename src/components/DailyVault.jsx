import { useState, useEffect } from 'react'
import './DailyVault.css'

function DailyVault({ onClose }) {
  const [dayNumbers] = useState(() => Array.from({ length: 365 }, (_, i) => i + 1))
  const [selectedDay, setSelectedDay] = useState(null)

  const getDailyChallenge = (dayNumber) => {
    // Generate deterministic challenge based on day number
    const daySeed = new Date(2024, 0, dayNumber).toISOString().slice(0, 10)
    const hash = Array.from(daySeed).reduce((a, c) => (((a << 5) - a) + c.charCodeAt(0)) | 0, 0)
    const challengeIdx = Math.abs(hash) % 3
    const challenges = ['Fast Enemies', 'Low Gravity', 'Double Powerups']
    return {
      label: challenges[challengeIdx],
      description: challengeIdx === 0 ? '⚡ Enemies spawn 20% faster and move 20% faster' :
                   challengeIdx === 1 ? '🌌 Reduced gravity affects enemy movement patterns' :
                   '✨ Powerups spawn at double the normal rate'
    }
  }

  return (
    <div className="daily-vault-page">
      <div className="daily-vault-background">
        <div className="daily-vault-stars"></div>
      </div>

      <div className="daily-vault-container">
        <header className="daily-vault-header">
          <div className="daily-vault-header-content">
            <h1 className="daily-vault-main-title">
              <span className="daily-vault-title-icon">🗓️</span>
              Daily Vault
            </h1>
            <p className="daily-vault-header-subtitle">Browse days 1-365</p>
          </div>
          <button className="daily-vault-back-button" onClick={onClose}>
            <span className="back-icon">←</span>
            Back to Menu
          </button>
        </header>

        <div className="daily-vault-section">
          <div className="daily-vault-grid">
            {dayNumbers.map((dayNumber) => {
              const challenge = getDailyChallenge(dayNumber)
              return (
                <div
                  key={dayNumber}
                  className="daily-vault-card"
                  onClick={() => setSelectedDay(selectedDay === dayNumber ? null : dayNumber)}
                >
                  <div className="daily-vault-card-number">Day {dayNumber}</div>
                  <div className="daily-vault-card-challenge">{challenge.label}</div>
                  {selectedDay === dayNumber && (
                    <div className="daily-vault-card-description">{challenge.description}</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DailyVault

