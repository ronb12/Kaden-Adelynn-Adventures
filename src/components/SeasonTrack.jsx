import { useState, useEffect } from 'react'
import './SeasonTrack.css'

function SeasonTrack({ onClose }) {
  const [seasonProgress, setSeasonProgress] = useState(() => {
    const saved = localStorage.getItem('seasonProgress')
    return saved ? parseInt(saved) : 0
  })

  const tiers = [
    { threshold: 0, reward: '100 ⭐', name: 'Starter' },
    { threshold: 1000, reward: '250 ⭐', name: 'Bronze' },
    { threshold: 2500, reward: '500 ⭐', name: 'Silver' },
    { threshold: 5000, reward: '1000 ⭐', name: 'Gold' },
    { threshold: 10000, reward: '2500 ⭐', name: 'Platinum' },
    { threshold: 20000, reward: '5000 ⭐', name: 'Diamond' },
  ]

  const currentTier = tiers.findIndex(tier => seasonProgress < tier.threshold) - 1
  const activeTier = currentTier >= 0 ? currentTier : tiers.length - 1

  return (
    <div className="season-track-page">
      <div className="season-track-background">
        <div className="season-track-stars"></div>
      </div>

      <div className="season-track-container">
        <header className="season-track-header">
          <div className="season-track-header-content">
            <h1 className="season-track-main-title">
              <span className="season-track-title-icon">📅</span>
              Season Track
            </h1>
            <p className="season-track-header-subtitle">Earn points to unlock tier rewards</p>
          </div>
          <button className="season-track-back-button" onClick={onClose}>
            <span className="back-icon">←</span>
            Back to Menu
          </button>
        </header>

        <div className="season-track-progress-card">
          <div className="season-track-progress-label">Current Progress</div>
          <div className="season-track-progress-value">{seasonProgress.toLocaleString()} points</div>
          <div className="season-track-progress-bar">
            <div 
              className="season-track-progress-fill"
              style={{ width: `${Math.min(100, (seasonProgress / (tiers[activeTier + 1]?.threshold || 20000)) * 100)}%` }}
            />
          </div>
        </div>

        <div className="season-track-section">
          <div className="season-track-list">
            {tiers.map((tier, index) => {
              const isUnlocked = seasonProgress >= tier.threshold
              const isActive = index === activeTier + 1
              
              return (
                <div
                  key={index}
                  className={`season-track-row ${isUnlocked ? 'unlocked' : ''} ${isActive ? 'active' : ''}`}
                >
                  <div className="season-track-row-tier">
                    <div className="season-track-row-tier-name">{tier.name}</div>
                    <div className="season-track-row-tier-threshold">{tier.threshold.toLocaleString()} pts</div>
                  </div>
                  <div className="season-track-row-reward">{tier.reward}</div>
                  <div className="season-track-row-status">
                    {isUnlocked ? '✓' : isActive ? '▶' : '🔒'}
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

export default SeasonTrack

