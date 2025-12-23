import { useState, useEffect } from 'react'
import { getStats } from '../utils/gameStats'
import './StatisticsDashboard.css'

function StatisticsDashboard({ onClose }) {
  const [stats, setStats] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    setStats(getStats())
  }, [])

  if (!stats) {
    return (
      <div className="stats-overlay">
        <div className="stats-container">
          <p>Loading statistics...</p>
        </div>
      </div>
    )
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Never'
    return new Date(timestamp).toLocaleDateString()
  }

  return (
    <div className="stats-overlay">
      <div className="stats-container">
        <div className="stats-header">
          <h1>📊 Statistics Dashboard</h1>
          <button className="stats-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="stats-tabs">
          <button
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={activeTab === 'weapons' ? 'active' : ''}
            onClick={() => setActiveTab('weapons')}
          >
            Weapons
          </button>
          <button
            className={activeTab === 'performance' ? 'active' : ''}
            onClick={() => setActiveTab('performance')}
          >
            Performance
          </button>
          <button
            className={activeTab === 'progress' ? 'active' : ''}
            onClick={() => setActiveTab('progress')}
          >
            Progress
          </button>
        </div>

        <div className="stats-content">
          {activeTab === 'overview' && (
            <div className="stats-section">
              <div className="stat-grid">
                <div className="stat-card">
                  <div className="stat-label">Total Games</div>
                  <div className="stat-value">{stats.totalGamesPlayed}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Total Play Time</div>
                  <div className="stat-value">{formatTime(stats.totalPlayTime)}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Total Score</div>
                  <div className="stat-value">{stats.totalScore.toLocaleString()}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Total Kills</div>
                  <div className="stat-value">{stats.totalKills.toLocaleString()}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Waves Completed</div>
                  <div className="stat-value">{stats.totalWavesCompleted}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Bosses Defeated</div>
                  <div className="stat-value">{stats.totalBossesDefeated}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Favorite Weapon</div>
                  <div className="stat-value">{stats.favoriteWeapon || 'N/A'}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Accuracy</div>
                  <div className="stat-value">{stats.bestAccuracy}%</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Current Streak</div>
                  <div className="stat-value">{stats.currentStreak} days</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">First Played</div>
                  <div className="stat-value">{formatDate(stats.firstPlayDate)}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Last Played</div>
                  <div className="stat-value">{formatDate(stats.lastPlayDate)}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Longest Session</div>
                  <div className="stat-value">{formatTime(stats.longestSession)}</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'weapons' && (
            <div className="stats-section">
              <h2>Weapon Statistics</h2>
              <div className="weapon-stats-list">
                {Object.entries(stats.weaponsUsed).map(([weapon, data]) => (
                  <div key={weapon} className="weapon-stat-item">
                    <div className="weapon-name">{weapon.toUpperCase()}</div>
                    <div className="weapon-details">
                      <span>Used: {data.count} times</span>
                      <span>Kills: {data.kills}</span>
                      <span>Accuracy: {data.accuracy || 0}%</span>
                    </div>
                  </div>
                ))}
                {Object.keys(stats.weaponsUsed).length === 0 && (
                  <p className="no-data">No weapon data yet. Play the game to see statistics!</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="stats-section">
              <h2>Best Performance</h2>
              <div className="stat-grid">
                <div className="stat-card highlight">
                  <div className="stat-label">Highest Score</div>
                  <div className="stat-value">{stats.highestScore.toLocaleString()}</div>
                </div>
                <div className="stat-card highlight">
                  <div className="stat-label">Highest Wave</div>
                  <div className="stat-value">{stats.highestWave}</div>
                </div>
                <div className="stat-card highlight">
                  <div className="stat-label">Highest Combo</div>
                  <div className="stat-value">{stats.highestCombo}</div>
                </div>
                <div className="stat-card highlight">
                  <div className="stat-label">Most Kills</div>
                  <div className="stat-value">{stats.highestKills}</div>
                </div>
              </div>
              <h3>Average Performance</h3>
              <div className="stat-grid">
                <div className="stat-card">
                  <div className="stat-label">Average Score</div>
                  <div className="stat-value">{stats.averageScore.toLocaleString()}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Average Wave</div>
                  <div className="stat-value">{stats.averageWave}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Average Kills</div>
                  <div className="stat-value">{stats.averageKills}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Average Session</div>
                  <div className="stat-value">{formatTime(stats.averageSessionTime)}</div>
                </div>
              </div>
              <h3>Boss Performance</h3>
              <div className="stat-grid">
                <div className="stat-card">
                  <div className="stat-label">Fastest Boss Kill</div>
                  <div className="stat-value">{stats.fastestBossKill > 0 ? `${stats.fastestBossKill}s` : 'N/A'}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Average Boss Time</div>
                  <div className="stat-value">{stats.averageBossKillTime > 0 ? `${stats.averageBossKillTime}s` : 'N/A'}</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="stats-section">
              <h2>Difficulty Progress</h2>
              <div className="difficulty-stats">
                {Object.entries(stats.gamesByDifficulty).map(([difficulty, count]) => (
                  <div key={difficulty} className="difficulty-stat">
                    <div className="difficulty-name">{difficulty.toUpperCase()}</div>
                    <div className="difficulty-details">
                      <span>Games: {count}</span>
                      <span>Best Score: {stats.bestScoreByDifficulty[difficulty]?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
              <h3>Combo Statistics</h3>
              <div className="stat-grid">
                <div className="stat-card">
                  <div className="stat-label">Total Combos</div>
                  <div className="stat-value">{stats.totalCombos}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Highest Combo Streak</div>
                  <div className="stat-value">{stats.highestComboStreak}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Average Combo</div>
                  <div className="stat-value">{stats.averageCombo}</div>
                </div>
              </div>
              <h3>Power-ups Collected</h3>
              <div className="powerup-stats">
                <div className="stat-card">
                  <div className="stat-label">Total Collected</div>
                  <div className="stat-value">{stats.totalPowerUpsCollected}</div>
                </div>
                <div className="powerup-list">
                  {Object.entries(stats.powerUpsCollected).map(([type, count]) => (
                    <div key={type} className="powerup-item">
                      <span>{type}</span>
                      <span>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StatisticsDashboard
