import { useState, useEffect } from 'react'
import './Leagues.css'

function Leagues({ onClose }) {
  const [currentTier, setCurrentTier] = useState('Bronze')
  const [leagueProgress, setLeagueProgress] = useState(0)

  const tiers = [
    { name: 'Bronze', threshold: 0, color: '#cd7f32' },
    { name: 'Silver', threshold: 1000, color: '#c0c0c0' },
    { name: 'Gold', threshold: 2500, color: '#ffd700' },
    { name: 'Platinum', threshold: 5000, color: '#e5e4e2' },
    { name: 'Diamond', threshold: 10000, color: '#b9f2ff' },
  ]

  const leaderboard = [
    { rank: 1, name: 'SpaceWarrior', score: 12500 },
    { rank: 2, name: 'StarHunter', score: 11200 },
    { rank: 3, name: 'CosmicPilot', score: 9800 },
    { rank: 4, name: 'NebulaKing', score: 8500 },
    { rank: 5, name: 'GalaxyMaster', score: 7200 },
  ]

  return (
    <div className="leagues-page">
      <div className="leagues-background">
        <div className="leagues-stars"></div>
      </div>

      <div className="leagues-container">
        <header className="leagues-header">
          <div className="leagues-header-content">
            <h1 className="leagues-main-title">
              <span className="leagues-title-icon">🏆</span>
              Leagues
            </h1>
            <p className="leagues-header-subtitle">Compete in weekly leagues</p>
          </div>
          <button className="leagues-back-button" onClick={onClose}>
            <span className="back-icon">←</span>
            Back to Menu
          </button>
        </header>

        <div className="leagues-tier-card">
          <div className="leagues-tier-label">Your Current Tier</div>
          <div className="leagues-tier-name" style={{ color: tiers.find(t => t.name === currentTier)?.color }}>
            {currentTier}
          </div>
          <div className="leagues-tier-progress">
            <div className="leagues-tier-progress-bar">
              <div 
                className="leagues-tier-progress-fill"
                style={{ width: `${(leagueProgress / 10000) * 100}%` }}
              />
            </div>
            <div className="leagues-tier-progress-text">{leagueProgress.toLocaleString()} / 10,000 points</div>
          </div>
        </div>

        <div className="leagues-leaderboard-card">
          <h2 className="leagues-leaderboard-title">Weekly Leaderboard</h2>
          <div className="leagues-leaderboard-list">
            {leaderboard.map((entry) => (
              <div key={entry.rank} className="leagues-leaderboard-row">
                <div className="leagues-leaderboard-rank">#{entry.rank}</div>
                <div className="leagues-leaderboard-name">{entry.name}</div>
                <div className="leagues-leaderboard-score">{entry.score.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Leagues

